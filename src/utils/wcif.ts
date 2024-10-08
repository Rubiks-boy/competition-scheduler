import {
  Activity,
  activityCodeToName,
  AdvancementCondition,
  Cutoff,
  parseActivityCode,
  Room,
  RoundFormat,
  TimeLimit,
  Venue,
} from "@wca/helpers";
import {
  ROUND_FORMAT,
  DEFAULT_CUTOFFS,
  DEFAULT_TIME_LIMITS,
  EXTENSIONS_SPEC_URL,
  OTHER_ACTIVITES,
  ONE_DAY_MS,
  ACTIVITY_NAMES,
} from "../constants";
import {
  CustomStage,
  DayDivider,
  EventId,
  Events,
  EVENT_IDS,
  ManageableCompetition,
  OtherActivity,
  Round,
  RoundExtension,
  Schedule,
  ScheduleEntry,
  ScheduleWithTimes,
  Wcif,
  WcifEvent,
  WcifRoom,
  WcifRound,
  WcifSchedule,
  WithTime,
  SimulGroup,
  SecondaryEvent,
  GroupExtension,
} from "../types";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcScheduleTimes,
  calcSimulGroupsWithTimes,
  calcTimeForRound,
} from "./calculators";
import {
  calcNumCompetitorsPerRound,
  getNumCompetitorsValue,
  isOverlappingDates,
  makeDefaultEvents,
  range,
  splitEvenlyWithRounding,
} from "./utils";

const getAdvancementForRound = (
  wcifRounds: Array<WcifRound>,
  roundNum: number
) => {
  // ex. if roundNum is 2, will find the event with 'eventId-r2'
  const round = wcifRounds.find(({ id }) => id.includes(`-r${roundNum}`));

  if (
    !round?.advancementCondition?.type ||
    round.advancementCondition.type === "attemptResult"
  ) {
    // Attempt results-based advancements are currently not supported.
    // Return a dummy value
    return { level: 0, type: "ranking" };
  }

  return {
    level: round.advancementCondition.level,
    type: round.advancementCondition.type,
  };
};

const wcifActivityToGroups = (
  wcifActivities: Activity[],
  numCompetitors: number,
  numGroups: number,
  secondaryActivities: Activity[],
  overlappingChildActivities: Activity[]
): SimulGroup[] => {
  const childActivities = wcifActivities
    .flatMap((act) => act.childActivities ?? [])
    .filter(
      // If it's simul with a separate event, we'll already
      // include the child activity under that other event
      // Exclude it here so we don't duplicate groups
      (ca) => !overlappingChildActivities.includes(ca)
    );
  if (!childActivities.length) {
    return [];
  }

  // `numCompetitors` represents the _total_ number of expected registrations for the round
  // Some of our child activities may also have a number of competitors
  // For the child activities that don't have numCompetitors listed,
  // split up whatever remains after subtracting the values that're explicitly declared
  const groupsWithExtension: string[] = [];
  let numCompetitorsInExtension = 0;
  childActivities.forEach((ca) => {
    const extension = ca.extensions.find(
      ({ id }) => id === "competitionScheduler.GroupConfig"
    ) as GroupExtension | undefined;

    if (extension?.data.numCompetitors) {
      groupsWithExtension.push(ca.activityCode);
      numCompetitorsInExtension += extension.data.numCompetitors;
    }
  }, 0);

  const numGroupsWithExtension = new Set(groupsWithExtension).size;

  const defaultNumCompetitors =
    numCompetitors - numCompetitorsInExtension > 0
      ? splitEvenlyWithRounding(
          numCompetitors - numCompetitorsInExtension,
          numGroups - numGroupsWithExtension,
          1
        )
      : [];
  let numCompetitorsIdx = 0;

  return (
    childActivities
      .map((ca) => {
        const startTime = new Date(ca.startTime);
        const endTime = new Date(ca.endTime);
        const wcifScheduledTime: number =
          endTime.getTime() - startTime.getTime();

        const extension = ca.extensions.find(
          ({ id }) => id === "competitionScheduler.GroupConfig"
        ) as GroupExtension | undefined;

        const numCompetitorsInGroup: number =
          extension?.data.numCompetitors ??
          defaultNumCompetitors[numCompetitorsIdx++] ??
          0;

        // Find all matches secondary activities, across all stages
        const matchingSecondaryActivities = secondaryActivities.filter((act) =>
          isOverlappingDates(
            {
              startTime: new Date(act.startTime),
              endTime: new Date(act.endTime),
            },
            {
              startTime,
              endTime,
            }
          )
        );

        let secondaryEvent: SecondaryEvent | undefined = undefined;
        if (matchingSecondaryActivities.length) {
          const { eventId, roundNumber } = parseActivityCode(
            matchingSecondaryActivities[0].activityCode
          );

          const numCompetitors = matchingSecondaryActivities.reduce(
            (sum, act) => {
              const secondaryActExtension = act.extensions.find(
                ({ id }) => id === "competitionScheduler.GroupConfig"
              ) as GroupExtension | undefined;

              return sum + (secondaryActExtension?.data.numCompetitors ?? 0);
            },
            0
          );

          if (roundNumber) {
            secondaryEvent = {
              eventId,
              roundIndex: roundNumber - 1,
              numCompetitors: `${numCompetitors}`,
            };
          }
        }

        return {
          activityCode: ca.activityCode,
          numMainCompetitors: numCompetitorsInGroup,
          // Round to the nearest 5 minutes
          scheduledTime: `${Math.floor(wcifScheduledTime / 1000 / 60 / 5) * 5}`,
          secondaryEvent,
          startTime,
        };
      })
      // The child activities array includes _all_ stages
      // Merge the activities that are at the same time
      .reduce(
        (acc, ca) => {
          const existingIdx = acc.findIndex(
            (g) => g.activityCode === ca.activityCode
          );

          if (existingIdx === -1) {
            acc.push(ca);
          } else {
            // Jankness alert: the secondaryEvent's numCompetitors is already merged!
            // So we don't need to merge here, and instead can just
            // choose whichever one we came across first.
            acc[existingIdx].numMainCompetitors += ca.numMainCompetitors;
          }

          return acc;
        },
        [] as {
          startTime: Date;
          activityCode: string;
          scheduledTime: string;
          numMainCompetitors: number;
          secondaryEvent?: SecondaryEvent;
        }[]
      )
      // Sort the groups by start time
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .map(({ scheduledTime, numMainCompetitors, secondaryEvent }) => ({
        scheduledTime,
        numMainCompetitors: `${numMainCompetitors}`,
        secondaryEvent,
      }))
  );
};

const wcifRoundsToEventRounds = (
  wcifRounds: Array<WcifRound>,
  eventId: EventId,
  competitorLimit: number,
  numStations: number,
  wcifSchedule: WcifSchedule,
  mainEventStartAndEndTimes: Record<string, { startTime: Date; endTime: Date }>,
  overlappingChildActivities: Array<Activity>,
  speedOffset: number
): { rounds: Array<Round>; numCompetitorsPerRound: Array<number> } => {
  const rounds: Array<Round> = [];
  const numCompetitorsPerRound: Array<number> = [];
  wcifRounds.forEach(({ extensions }, roundIndex) => {
    const roundNum = roundIndex + 1;

    const extension = extensions.find(
      ({ id }) => id === "competitionScheduler.RoundConfig"
    ) as RoundExtension | undefined;

    const { level, type } = getAdvancementForRound(wcifRounds, roundNum - 1);

    let numCompetitors: number;
    if (type === "percent") {
      numCompetitors = Math.floor(
        (numCompetitorsPerRound[roundIndex - 1] * level) / 100
      );
    } else if (extension?.data.expectedRegistrations) {
      numCompetitors = extension?.data.expectedRegistrations;
    } else if (roundNum === 1) {
      numCompetitors = calcExpectedNumCompetitors(eventId, competitorLimit);
    } else {
      numCompetitors = level;
    }

    const simulGroupsWithOtherEvents: string[] = [];
    overlappingChildActivities.forEach(({ activityCode, extensions }) => {
      const code = parseActivityCode(activityCode);
      if (eventId === code.eventId && roundIndex + 1 === code.roundNumber) {
        simulGroupsWithOtherEvents.push(activityCode);
      }
    });
    const numSimulGroups = new Set(simulGroupsWithOtherEvents).size;

    const numGroups =
      extension?.data.groupCount ??
      calcNumGroups({
        eventId,
        numCompetitors,
        numStations,
      });

    const scheduledTime = calcTimeForRound(
      eventId,
      Math.max(numGroups - numSimulGroups, 0),
      true,
      speedOffset
    );

    const wcifActivities = findMatchingWcifActivities({
      wcifSchedule,
      type: "event",
      eventId,
      roundNum,
    });

    const wcifStartEndTime =
      mainEventStartAndEndTimes[`${eventId}-r${roundIndex + 1}`];

    const secondaryActivities = wcifStartEndTime
      ? overlappingChildActivities.filter((act) =>
          isOverlappingDates(
            {
              startTime: new Date(act.startTime),
              endTime: new Date(act.endTime),
            },
            wcifStartEndTime
          )
        )
      : [];

    let round: Round;
    if (
      (secondaryActivities.length || numSimulGroups) &&
      wcifActivities.some((act) => act.childActivities?.length)
    ) {
      round = {
        type: "groups",
        eventId,
        groups: wcifActivityToGroups(
          wcifActivities,
          numCompetitors,
          numGroups,
          secondaryActivities,
          overlappingChildActivities
        ),
      };
    } else {
      round = {
        type: "aggregate",
        eventId,
        totalNumCompetitors:
          type === "percent" ? `${level}%` : numCompetitors.toString(),
        numGroups: numGroups.toString(),
        scheduledTime: scheduledTime.toString(),
      };

      if (wcifStartEndTime) {
        const wcifScheduledTime =
          wcifStartEndTime.endTime.getTime() -
          wcifStartEndTime.startTime.getTime();

        round.scheduledTime = `${
          // Round to the nearest 5 minutes
          Math.floor(wcifScheduledTime / 1000 / 60 / 5) * 5
        }`;
      }
    }

    numCompetitorsPerRound.push(numCompetitors);
    rounds.push(round);
  });
  return { rounds, numCompetitorsPerRound };
};

export const getNumStationsFromWcif = (wcif: Wcif): number | null => {
  const rooms = wcif.schedule.venues?.flatMap((venue) => venue.rooms) || [];

  let sum = 0;
  rooms.forEach((room) => {
    const groupifierRoomConfig = room.extensions.find(
      ({ id }) => id === "groupifier.RoomConfig"
    );

    if (groupifierRoomConfig) {
      const data = groupifierRoomConfig.data as { stations: number };
      sum += data.stations;
    }
  });

  return sum;
};

export const getDefaultNumStations = (
  competitorLimit: number | null
): number => {
  if (!competitorLimit) {
    return 8;
  }

  if (competitorLimit >= 200) {
    return 24;
  }
  if (competitorLimit >= 150) {
    return 20;
  }
  if (competitorLimit >= 120) {
    return 16;
  }
  if (competitorLimit >= 80) {
    return 12;
  }

  return 8;
};

// Edge case: If there's supposed to be competitors assigned,
// but there's zero non-simul groups that were assigned to,
// try to assign a number of competitors to simul groups
const assignRoundsWithOnlySimul = (
  events: Events,
  numCompetitorsByEventAndRound: Record<EventId, number[]>
) => {
  const zeroGroupRounds = Object.values(events).flatMap((rounds) => {
    return (rounds
      ?.map((round, i) => ({ round, roundIndex: i }))
      .filter(({ round }) => round.type === "groups" && !round.groups.length) ??
      []) as Array<{
      round: Round & { type: "aggregate" };
      roundIndex: number;
    }>;
  });

  const groupsWithSecondaryEvent = Object.values(events).flatMap((rs) => {
    return (
      rs?.flatMap((r) =>
        r.type === "groups" ? r.groups.filter((g) => !!g.secondaryEvent) : []
      ) ?? []
    );
  });

  zeroGroupRounds.forEach(({ round, roundIndex }) => {
    const numCompetitors =
      numCompetitorsByEventAndRound[round.eventId]?.[roundIndex] ?? 0;

    const simulGroupsWithoutCompetitors = groupsWithSecondaryEvent.filter(
      (g) =>
        g.secondaryEvent &&
        g.secondaryEvent.eventId === round.eventId &&
        g.secondaryEvent.roundIndex === roundIndex &&
        !parseInt(g.secondaryEvent.numCompetitors)
    );

    if (!numCompetitors || !simulGroupsWithoutCompetitors.length) {
      return;
    }

    round.totalNumCompetitors = "0";

    const numPerGroup = splitEvenlyWithRounding(
      numCompetitors,
      simulGroupsWithoutCompetitors.length,
      1
    );

    simulGroupsWithoutCompetitors.forEach((g, i) => {
      if (g.secondaryEvent) {
        g.secondaryEvent.numCompetitors = `${numPerGroup[i]}`;
      }
    });
  });

  return events;
};

export const getDefaultEventsData = ({
  wcif,
  numStations,
  competitorLimit,
  speedOffset,
}: {
  wcif: Wcif;
  numStations: number;
  competitorLimit: number;
  speedOffset: number;
}): Events => {
  const { events: wcifEvents } = wcif;

  const events = makeDefaultEvents();
  const numCompetitorsByEventAndRound = {} as Record<EventId, Array<number>>;

  const { startAndEndTimes, overlappingChildActivities } =
    getMainEventStartAndEndTimes(wcif.schedule);

  wcifEvents.forEach(({ id, rounds }) => {
    // Sort based on round number
    const sortedRounds = [...rounds].sort(
      (a, b) =>
        (parseActivityCode(a.id).roundNumber ?? 0) -
        (parseActivityCode(b.id).roundNumber ?? 0)
    );
    const result = wcifRoundsToEventRounds(
      sortedRounds,
      id,
      competitorLimit || 0,
      numStations,
      wcif.schedule,
      startAndEndTimes,
      overlappingChildActivities,
      speedOffset
    );

    events[id] = result.rounds;
    numCompetitorsByEventAndRound[id] = result.numCompetitorsPerRound;
  });

  return assignRoundsWithOnlySimul(events, numCompetitorsByEventAndRound);
};

export const getAllActivities = (wcifSchedule: WcifSchedule) => {
  const rooms = wcifSchedule.venues?.flatMap((venue) => venue.rooms) || [];
  return rooms?.flatMap((room) => room.activities);
};

const getNumGroupsAfter = (
  childActivity: Activity,
  childActivities: Activity[]
) => {
  const { eventId, roundNumber } = parseActivityCode(
    childActivity.activityCode
  );

  if (!roundNumber) {
    return 0;
  }

  return childActivities.filter((ca) => {
    // Filter to activities in the round
    const code = parseActivityCode(ca.activityCode);
    return (
      code.eventId === eventId &&
      code.roundNumber === roundNumber &&
      new Date(ca.startTime).getTime() >
        new Date(childActivity.startTime).getTime()
    );
  }).length;
};

// Gets the start and end times for main events
// Excludes simul child activities
export const getMainEventStartAndEndTimes = (wcifSchedule: WcifSchedule) => {
  const activities = getAllActivities(wcifSchedule);
  if (!activities.length) {
    return { startAndEndTimes: {}, overlappingChildActivities: [] };
  }

  const childActivities = activities
    .flatMap((a) => {
      return a.childActivities?.length ? a.childActivities : a;
    })
    .filter((a) => a.activityCode.indexOf("other") === -1);
  childActivities.sort((a, b) => {
    const startTimeDiff =
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    if (startTimeDiff) {
      return startTimeDiff;
    }

    // If there's the same start time, most of the time it doesn't matter which is considered
    // the "main" event vs. the "secondary" event.
    // The one edge case is if there's a simul group that isn't contiguous with the rest of the round:
    // choosing the non-contiguous one as our main event would result in needing two separate main
    // rounds, which isn't really supported
    // Get around this by finding which has the most child activities after the current one,
    // and making that one first.
    // This isn't perfect (especially if someone edits the schedule manually on the WCA site)
    // but is "good enough" for now
    return (
      getNumGroupsAfter(a, childActivities) -
      getNumGroupsAfter(b, childActivities)
    );
  });

  const startAndEndTimes: Record<string, { startTime: Date; endTime: Date }> =
    {};
  const overlappingChildActivities: Array<Activity> = [];
  let nextStartTime = new Date(childActivities[0].startTime);
  let currRound = parseActivityCode(childActivities[0].activityCode);
  for (const childActivity of childActivities) {
    const start = new Date(childActivity.startTime);
    const code = parseActivityCode(childActivity.activityCode);
    if (start < nextStartTime) {
      // We're simul with a previous child activity
      // Save it for use as a secondaryEvent later
      if (
        code.eventId !== currRound.eventId ||
        code.roundNumber !== currRound.roundNumber
      ) {
        overlappingChildActivities.push(childActivity);
      }

      continue;
    }

    // New main activity
    const { activityCode } = childActivity;
    const { eventId, roundNumber } = parseActivityCode(activityCode);
    const eventRoundTuple = `${eventId}-r${roundNumber}`;

    // If there's already a start time, that one will be earlier
    const startTime =
      startAndEndTimes[eventRoundTuple]?.startTime ??
      new Date(childActivity.startTime);
    const endTime = new Date(childActivity.endTime);
    startAndEndTimes[eventRoundTuple] = {
      startTime,
      endTime,
    };

    // Heuristic: End time of one round is the min start time for the next round
    nextStartTime = endTime;
    currRound = code;
  }

  return { startAndEndTimes, overlappingChildActivities };
};

export const findMatchingWcifActivities = ({
  wcifSchedule,
  type,
  eventId,
  roundNum,
}: {
  wcifSchedule: WcifSchedule;
  type: "event" | "other";
  eventId?: string;
  roundNum?: number;
}) => {
  const allActivities = getAllActivities(wcifSchedule);

  const activityCode =
    type === "event" && roundNum
      ? `${eventId}-r${roundNum}`
      : `other-${eventId}`;

  return allActivities.filter(
    (activity) => activity.activityCode === activityCode
  );
};

export const findMatchingWcifActivity = ({
  wcifSchedule,
  type,
  eventId,
  roundNum,
  nthOccurrence = 1,
}: {
  wcifSchedule: WcifSchedule;
  type: "event" | "other";
  eventId?: string;
  roundNum?: number;
  nthOccurrence?: number;
}): Activity | undefined => {
  const matches = findMatchingWcifActivities({
    wcifSchedule,
    type,
    eventId,
    roundNum,
  });

  return matches[nthOccurrence - 1];
};

const getStartTimeForEntry = (
  scheduleEntry: ScheduleEntry | DayDivider,
  wcifSchedule: WcifSchedule,
  firstStartTime: Date,
  nthOccurrence: number = 1
) => {
  const startDate = new Date(firstStartTime);
  startDate.setHours(0, 0, 0, 0);

  if (scheduleEntry.type === "day-divider") {
    return scheduleEntry.dayIndex * ONE_DAY_MS + startDate.getTime();
  }

  const { type, eventId } = scheduleEntry;

  const activity = findMatchingWcifActivity({
    wcifSchedule,
    type,
    eventId,
    roundNum: type === "event" ? scheduleEntry.roundNum + 1 : undefined,
    nthOccurrence,
  });
  return new Date(activity?.startTime ?? 0).getTime();
};

export const reorderFromWcif = ({
  schedule,
  wcifSchedule,
  firstStartTime,
}: {
  schedule: Schedule;
  wcifSchedule: WcifSchedule;
  firstStartTime: Date;
}): Schedule => {
  const otherActivityOccurrences: Record<string, number> = {};
  const sortedSchedule = schedule.map((s) => {
    if (s.type !== "other") {
      return { ...s, nthOccurrence: 1 };
    }

    if (!(s.eventId in otherActivityOccurrences)) {
      otherActivityOccurrences[s.eventId] = 0;
    }
    const nthOccurrence = ++otherActivityOccurrences[s.eventId];
    return { ...s, nthOccurrence };
  });

  sortedSchedule.sort((a, b) => {
    const aStartTime = getStartTimeForEntry(
      a,
      wcifSchedule,
      firstStartTime,
      a.nthOccurrence
    );
    const bStartTime = getStartTimeForEntry(
      b,
      wcifSchedule,
      firstStartTime,
      b.nthOccurrence
    );

    return aStartTime - bStartTime;
  });

  return sortedSchedule;
};

export const getDefaultSchedule = (
  events: Events,
  numberOfDays: number,
  numOtherActivities: Record<OtherActivity, string>
): Schedule => {
  const scheduleEvents = EVENT_IDS.flatMap((eventId) =>
    (events[eventId] ?? []).map((_, roundNum) => ({
      type: "event" as const,
      eventId,
      roundNum,
    }))
  );

  const dayDividers = range(1, numberOfDays).map((dayIndex) => ({
    type: "day-divider" as const,
    dayIndex,
  }));

  const otherActivities: Array<ScheduleEntry> = [];
  OTHER_ACTIVITES.forEach((otherActivity) => {
    const num = parseInt(numOtherActivities[otherActivity]);
    range(num).forEach((index) => {
      otherActivities.push({ type: "other", eventId: otherActivity, index });
    });
  });

  return [
    { type: "day-divider", dayIndex: 0 },
    ...scheduleEvents,
    ...dayDividers,
    ...otherActivities,
  ];
};

const getDefaultWcifEvent = (eventId: EventId) => ({
  id: eventId,
  rounds: [],
  extensions: [],
});

const getDefaultTimeLimit = (
  eventId: EventId,
  roundNum: number
): TimeLimit | null => {
  const defaultTimeLimit = DEFAULT_TIME_LIMITS[eventId];

  if (roundNum === 1) {
    return defaultTimeLimit;
  }

  if (eventId === "333bf") {
    return defaultTimeLimit;
  }

  // For all events with a time limit in the first round,
  // set the time limit to 10 min in subsequent rounds
  return !!defaultTimeLimit
    ? { centiseconds: 60000, cumulativeRoundIds: [] }
    : null;
};

const getDefaultCutoff = (
  eventId: EventId,
  roundNum: number
): Cutoff | null => {
  if (roundNum > 1) {
    return null;
  }

  return DEFAULT_CUTOFFS[eventId];
};

const getDefaultWcifRound = (
  eventId: EventId,
  roundNum: number,
  format: RoundFormat
) => {
  return {
    id: `${eventId}-r${roundNum}`,
    format,
    timeLimit: getDefaultTimeLimit(eventId, roundNum),
    cutoff: getDefaultCutoff(eventId, roundNum),
    advancementCondition: null,
    results: [],
    extensions: [],
  };
};

const createWcifEvent = (
  eventId: EventId,
  events: Events,
  originalWcifEvent: WcifEvent | undefined
): WcifEvent | null => {
  const rounds = events[eventId];
  if (!rounds || !rounds.length) {
    return null;
  }

  const numCompetitorsPerRound = calcNumCompetitorsPerRound(rounds, events);
  const allRounds = Object.values(events).flatMap((rounds) =>
    rounds ? rounds : []
  );

  return {
    ...getDefaultWcifEvent(eventId),
    ...originalWcifEvent,
    rounds: rounds.map((round, index) => {
      let advancementCondition: AdvancementCondition | null = null;
      const nextRound = rounds[index + 1];
      if (nextRound) {
        const { value, isPercent } = getNumCompetitorsValue(nextRound);
        advancementCondition = {
          type: isPercent ? "percent" : "ranking",
          level: value,
        };
      }

      const originalRound = originalWcifEvent?.rounds.find(
        ({ id }) => id === `${eventId}-r${index + 1}`
      );

      const numGroups =
        round.type === "groups"
          ? round.groups.length
          : parseInt(round.numGroups);

      const simulGroupsAttachedToOtherEvents: SimulGroup[] = allRounds.flatMap(
        (r) =>
          r.type === "groups"
            ? r.groups.filter(
                (g) =>
                  g.secondaryEvent &&
                  g.secondaryEvent.eventId === round.eventId &&
                  g.secondaryEvent.roundIndex === index
              )
            : []
      );
      const numSimulGroups = simulGroupsAttachedToOtherEvents.length;

      const extension: RoundExtension = {
        id: "competitionScheduler.RoundConfig",
        specUrl: EXTENSIONS_SPEC_URL,
        data: {
          expectedRegistrations: numCompetitorsPerRound[index] ?? null,
          groupCount: numGroups + numSimulGroups,
        },
      };

      const extensions = [
        ...(originalRound?.extensions ? originalRound?.extensions : []).filter(
          ({ id }) => id !== "competitionScheduler.RoundConfig"
        ),
        extension,
      ];

      return {
        ...getDefaultWcifRound(eventId, index + 1, ROUND_FORMAT[eventId]),
        ...originalRound,
        advancementCondition,
        ...(numGroups && {
          scrambleSetCount: numGroups + numSimulGroups + 1,
        }),
        extensions,
      };
    }),
  };
};

export const createWcifEvents = (
  events: Events,
  originalWcifEvents: Array<WcifEvent>
): Array<WcifEvent> => {
  const wcifEvents: Array<WcifEvent> = [];
  Object.keys(events).forEach((eventId) => {
    const originalWcifEvent = originalWcifEvents.find(
      ({ id }) => id === eventId
    );

    const newWcifEvent = createWcifEvent(
      eventId as EventId,
      events,
      originalWcifEvent
    );

    newWcifEvent && wcifEvents.push(newWcifEvent);
  });
  return wcifEvents;
};

const createChildActivities = ({
  scheduleEntry,
  events,
  simulGroupsWithTimes,
  getNextId,
  numStages,
  stageIndex,
}: {
  scheduleEntry: WithTime<ScheduleEntry>;
  events: Events;
  simulGroupsWithTimes: Array<WithTime<SimulGroup>>;
  getNextId: () => number;
  numStages: number;
  stageIndex: number;
}) => {
  if (scheduleEntry.type !== "event") {
    return [];
  }

  const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];

  if (!round) {
    return [];
  }

  let numGroups: number;
  let timeMsByGroup: number[];
  if (round?.type === "groups") {
    numGroups = round.groups.length;
    timeMsByGroup = round.groups.map(
      (r) => parseInt(r.scheduledTime) * 60 * 1000
    );
  } else {
    numGroups = parseInt(round?.numGroups ?? "1");
    timeMsByGroup = splitEvenlyWithRounding(
      scheduleEntry.scheduledTimeMs,
      numGroups,
      // Round to nearest 5 min
      1000 * 60 * 5
    );
  }

  const startTimeMs = scheduleEntry.startTime.getTime();
  let currStartTime = startTimeMs;
  const nonSimulGroups = range(numGroups).map((i) => {
    const startTime = currStartTime;
    const endTime = currStartTime + timeMsByGroup[i];
    currStartTime = endTime;

    const extensions =
      round.type === "groups"
        ? [
            {
              id: "competitionScheduler.GroupConfig",
              specUrl:
                "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md",
              data: {
                numCompetitors: splitEvenlyWithRounding(
                  parseInt(round.groups[i].numMainCompetitors),
                  numStages,
                  1
                )[stageIndex],
              },
            },
          ]
        : [];

    return {
      startTime: new Date(startTime),
      endTime: new Date(currStartTime),
      extensions,
    };
  });

  const simulGroups = simulGroupsWithTimes.map((g) => {
    const numCompetitors = g.secondaryEvent?.numCompetitors;

    const extensions = numCompetitors
      ? [
          {
            id: "competitionScheduler.GroupConfig",
            specUrl:
              "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md",
            data: {
              numCompetitors: splitEvenlyWithRounding(
                parseInt(numCompetitors),
                numStages,
                1
              )[stageIndex],
            },
          },
        ]
      : [];

    return {
      ...g,
      extensions,
    };
  });

  const allChildGroups = [...simulGroups, ...nonSimulGroups];
  return allChildGroups.map((childGroup, i) => {
    const activityCode = `${scheduleEntry.eventId}-r${
      scheduleEntry.roundNum + 1
    }-g${i + 1}`;

    return {
      id: getNextId(),
      name: activityCodeToName(activityCode),
      activityCode,
      startTime: childGroup.startTime.toISOString(),
      endTime: childGroup.endTime.toISOString(),
      childActivities: [],
      scrambleSetId: null,
      extensions: childGroup.extensions,
    };
  });
};

const createWcifRoom = ({
  scheduleWithTimes,
  originalWcifRoom,
  startingId = 1,
  stationsPerRoom,
  events,
  numStages,
  stageIndex,
}: {
  scheduleWithTimes: ScheduleWithTimes;
  originalWcifRoom: WcifRoom;
  startingId: number;
  stationsPerRoom: number;
  events: Events;
  numStages: number;
  stageIndex: number;
}) => {
  let nextId = startingId;
  const getNextId = () => nextId++;

  const groupifierRoomConfig = {
    id: "groupifier.RoomConfig",
    specUrl:
      "https://groupifier.jonatanklosko.com/wcif-extensions/RoomConfig.json",
    data: { stations: stationsPerRoom },
  };

  const newExtensions = [
    ...originalWcifRoom.extensions.filter(
      ({ id }) => id !== "groupifier.RoomConfig"
    ),
    groupifierRoomConfig,
  ];

  const scheduleEntriesWithTimes = scheduleWithTimes.filter(
    ({ type }) => type !== "day-divider"
  ) as Array<WithTime<ScheduleEntry & { nonSimulScheduledTimeMs: number }>>;

  return {
    ...originalWcifRoom,
    extensions: newExtensions,
    activities: scheduleEntriesWithTimes.map((scheduleEntry) => {
      const { type, startTime, endTime } = scheduleEntry;

      const activityCode =
        type === "event"
          ? `${scheduleEntry.eventId}-r${scheduleEntry.roundNum + 1}`
          : `other-${scheduleEntry.eventId}`;

      const originalActivity = originalWcifRoom.activities.find(
        (activity) => activity.activityCode === activityCode
      );

      const simulGroupsWithTimes =
        scheduleEntry.type === "event"
          ? calcSimulGroupsWithTimes(
              scheduleEntry.eventId,
              scheduleEntry.roundNum,
              scheduleWithTimes,
              events
            )
          : [];

      const childActivities = createChildActivities({
        scheduleEntry,
        simulGroupsWithTimes,
        events,
        getNextId,
        numStages,
        stageIndex,
      });

      const minStartTime = Math.min(
        startTime.getTime(),
        ...childActivities.map(({ startTime }) => new Date(startTime).getTime())
      );
      const maxEndTime = Math.max(
        endTime.getTime(),
        ...childActivities.map(({ endTime }) => new Date(endTime).getTime())
      );

      return {
        ...(originalActivity
          ? originalActivity
          : {
              name:
                scheduleEntry.type === "event"
                  ? activityCodeToName(activityCode)
                  : ACTIVITY_NAMES[scheduleEntry.eventId],
              activityCode,
              scrambleSetId: null,
              extensions: [],
            }),
        id: getNextId(),
        startTime: new Date(minStartTime).toISOString(),
        endTime: new Date(maxEndTime).toISOString(),
        childActivities,
      };
    }),
  };
};

export const createWcifSchedule = ({
  schedule,
  startTimes,
  originalWcifSchedule,
  originalCompetition,
  events,
  otherActivities,
  venueName,
  stagesInUse,
  numStations,
  numberOfDays,
}: {
  schedule: Schedule;
  startTimes: Array<Date>;
  originalWcifSchedule: WcifSchedule;
  originalCompetition: ManageableCompetition;
  events: Events;
  otherActivities: Record<OtherActivity, string>;
  venueName: string;
  stagesInUse: Array<CustomStage>;
  numStations: number;
  numberOfDays: number;
}) => {
  if (originalWcifSchedule.venues.length > 1) {
    // TODO: better erroring
    return originalWcifSchedule;
  }

  const originalVenue = originalWcifSchedule.venues[0];

  const newVenue: Venue = {
    id: 1,
    name: venueName,
    latitudeMicrodegrees: originalCompetition.latitude_degrees * 10 ** 6,
    longitudeMicrodegrees: originalCompetition.longitude_degrees * 10 ** 6,
    countryIso2: originalCompetition.country_iso2,
    // TODO don't autofill LA for everyone :(
    // There's probably some smart library someone made to convert lat/long -> timezone?
    timezone: "America/Los_Angeles",
    // Leave rooms blank here. We'll merge in rooms below.
    rooms: [],
    extensions: [],
  };

  const baseVenueInfo =
    originalWcifSchedule.venues.length > 0 ? originalVenue : newVenue;

  const newRooms: Array<Room> = stagesInUse.map(({ stage, color }, id) => ({
    id,
    name: stage,
    color,
    activities: [],
    extensions: [],
  }));

  const venueRooms =
    baseVenueInfo.rooms.length > 0 ? baseVenueInfo.rooms : newRooms;

  const scheduleWithTimes = calcScheduleTimes(
    startTimes,
    schedule,
    events,
    otherActivities
  );

  return {
    ...originalWcifSchedule,
    // Situations for venues / rooms:
    // 1. No venue and no rooms currently on website -> Use our new venue/stage info.
    // 2. Both venue and rooms already on website -> Keep the existing info
    // 3. A venue with no rooms on the website -> Keep existing venue, but add rooms (stages) to that venue.
    // Using baseVenueInfo + venueRooms makes sure it uses information already on the site or adds in the new info if needed.
    venues: [
      {
        ...baseVenueInfo,
        rooms: venueRooms.map((originalWcifRoom, idx) =>
          createWcifRoom({
            scheduleWithTimes,
            originalWcifRoom,
            startingId: idx * 10000,
            stationsPerRoom: Math.floor(numStations / venueRooms.length),
            events,
            numStages: venueRooms.length,
            stageIndex: idx,
          })
        ),
      },
    ],
    numberOfDays,
  };
};

export const getNumberOfActivities = (wcifSchedule: WcifSchedule) => {
  const defaultVenue: Venue | undefined = wcifSchedule.venues?.[0];
  const defaultActivities = defaultVenue?.rooms?.flatMap((r) => r.activities);

  const rooms = wcifSchedule.venues?.flatMap((venue) => venue.rooms) || [];
  const allActivities = rooms?.flatMap((room) => room.activities);

  const numOtherActivities = {} as Record<OtherActivity, string>;
  OTHER_ACTIVITES.forEach((activity) => {
    numOtherActivities[activity] = "0";

    if (defaultActivities) {
      const numDefault = defaultActivities.filter(
        ({ activityCode, startTime }, idx) =>
          activityCode.startsWith(`other-${activity}`) &&
          defaultActivities.findIndex((v) => v.startTime === startTime) === idx
      ).length;

      if (numDefault > 0) {
        numOtherActivities[activity] = `${numDefault}`;
        return;
      }
    }

    if (allActivities) {
      const hasActivity =
        allActivities.findIndex(({ activityCode }) =>
          activityCode.startsWith(`other-${activity}`)
        ) > -1;
      hasActivity && (numOtherActivities[activity] = "1");
    }
  });

  return numOtherActivities;
};

export const getOtherActivityLengths = (
  stateOtherActivities: Record<OtherActivity, string>,
  wcifSchedule: WcifSchedule
) => {
  const otherActivities = { ...stateOtherActivities };

  OTHER_ACTIVITES.forEach((otherActivity) => {
    const wcifActivity = findMatchingWcifActivity({
      wcifSchedule,
      type: "other",
      eventId: otherActivity,
    });

    if (wcifActivity) {
      const wcifScheduledTime =
        new Date(wcifActivity.endTime).getTime() -
        new Date(wcifActivity.startTime).getTime();

      otherActivities[otherActivity] = `${
        Math.floor(
          // Round to the nearest 5 minutes
          wcifScheduledTime / 1000 / 60 / 5
        ) * 5
      }`;
    }
  });

  return otherActivities;
};

export const getWcifStartTimes = (wcif: Wcif) => {
  const { numberOfDays } = wcif.schedule;
  const startTimes = getAllActivities(wcif.schedule).map(
    (a) => new Date(a.startTime)
  );
  startTimes.sort();
  const firstStartTime = startTimes?.[0];

  if (firstStartTime) {
    return range(numberOfDays).map(
      (dayIndex) =>
        startTimes.find((startTime) => {
          const daysDiff = startTime.getDay() - firstStartTime.getDay();
          return (daysDiff < 0 ? daysDiff + 7 : daysDiff) === dayIndex;
        }) ?? firstStartTime
    );
  }

  const wcifStartTime = new Date(wcif.schedule.startDate);
  // Correct for the start date being in UTC
  if (wcifStartTime.getHours() < 12) {
    wcifStartTime.setHours(8, 0, 0, 0); // previous 8:00am
  } else {
    wcifStartTime.setHours(32, 0, 0, 0); // next 8:00am
  }
  return range(numberOfDays).map(
    (i) => new Date(wcifStartTime.getTime() + ONE_DAY_MS * i)
  );
};
