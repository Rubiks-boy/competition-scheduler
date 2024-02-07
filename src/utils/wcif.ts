import type {
  AdvancementCondition,
  Cutoff,
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
  LONG_EVENT_NAMES,
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
  WcifPerson,
  WithTime,
  SimulGroup,
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
  constructActivityString,
  findNthOccurrence,
  makeDefaultEvents,
  numPersonsRegisteredForEvent,
  range,
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

const wcifRoundsToEventRounds = (
  wcifRounds: Array<WcifRound>,
  eventId: EventId,
  competitorLimit: number,
  numStations: number,
  wcifSchedule: WcifSchedule,
  wcifPersons: Array<WcifPerson>
): Array<Round> => {
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
        (numCompetitorsPerRound[roundNum - 1] * level) / 100
      );
    } else if (extension?.data.expectedRegistrations) {
      numCompetitors = extension?.data.expectedRegistrations;
    } else if (roundNum === 1) {
      numCompetitors = calcExpectedNumCompetitors(eventId, competitorLimit);
    } else {
      numCompetitors = level;
    }

    const numGroups =
      extension?.data.groupCount ??
      calcNumGroups({
        eventId,
        numCompetitors,
        numStations,
      });

    const scheduledTime = calcTimeForRound(eventId, numGroups);

    const numRegistered = numPersonsRegisteredForEvent(eventId, wcifPersons);

    const scheduleEntry = {
      eventId,
      totalNumCompetitors:
        type === "percent" ? `${level}%` : numCompetitors.toString(),
      numGroups: numGroups.toString(),
      scheduledTime: scheduledTime.toString(),
      roundNum,
      numRegistered,
      simulGroups: [],
    };

    const wcifActivity = findMatchingWcifActivity({
      wcifSchedule,
      type: "event",
      eventId,
      roundNum,
    });
    if (wcifActivity) {
      const wcifScheduledTime =
        new Date(wcifActivity.endTime).getTime() -
        new Date(wcifActivity.startTime).getTime();

      scheduleEntry.scheduledTime = `${Math.floor(
        wcifScheduledTime / 1000 / 60
      )}`;
    }

    numCompetitorsPerRound.push(numCompetitors);
    rounds.push(scheduleEntry);
  });
  return rounds;
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

export const getDefaultEventsData = ({
  wcif,
  numStations,
  competitorLimit,
}: {
  wcif: Wcif;
  numStations: number;
  competitorLimit: number;
}): Events => {
  const { events: wcifEvents } = wcif;

  const events = makeDefaultEvents();

  wcifEvents.forEach(({ id, rounds }) => {
    // Sort based on round number
    const sortedRounds = [...rounds].sort(
      (a, b) =>
        parseInt(a.id[a.id.indexOf("-r") + 2]) -
        parseInt(b.id[b.id.indexOf("-r") + 2])
    );
    events[id] = wcifRoundsToEventRounds(
      sortedRounds,
      id,
      competitorLimit || 0,
      numStations,
      wcif.schedule,
      wcif.persons
    );
  });

  return events;
};

export const getAllActivities = (wcifSchedule: WcifSchedule) => {
  const rooms = wcifSchedule.venues?.flatMap((venue) => venue.rooms) || [];
  return rooms?.flatMap((room) => room.activities);
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
}) => {
  const allActivities = getAllActivities(wcifSchedule);

  const activityCode =
    type === "event" && roundNum
      ? `${eventId}-r${roundNum}`
      : `other-${eventId}`;

  return findNthOccurrence(
    allActivities,
    (activity) => activity.activityCode === activityCode,
    nthOccurrence
  );
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

  const numCompetitorsPerRound = calcNumCompetitorsPerRound(rounds);

  return {
    ...getDefaultWcifEvent(eventId),
    ...originalWcifEvent,
    rounds: rounds.map((round, index) => {
      const advancementLevel = parseInt(
        rounds[index + 1]?.totalNumCompetitors || "0"
      );
      const isPercent = rounds[index + 1]?.totalNumCompetitors.endsWith("%");

      const advancementCondition: AdvancementCondition | null = advancementLevel
        ? {
            type: isPercent ? "percent" : "ranking",
            level: advancementLevel,
          }
        : null;

      const originalRound = originalWcifEvent?.rounds.find(
        ({ id }) => id === `${eventId}-r${index + 1}`
      );

      const extension: RoundExtension = {
        id: "competitionScheduler.RoundConfig",
        specUrl: EXTENSIONS_SPEC_URL,
        data: {
          expectedRegistrations: numCompetitorsPerRound[index] ?? null,
          groupCount: parseInt(round.numGroups) ?? null,
        },
      };

      const extensions = [
        ...(originalRound?.extensions ? originalRound?.extensions : []).filter(
          ({ id }) => id !== "competitionScheduler.RoundConfig"
        ),
        extension,
      ];

      const numSimulGroups = round.simulGroups.length;

      debugger;

      return {
        ...getDefaultWcifRound(eventId, index + 1, ROUND_FORMAT[eventId]),
        ...originalRound,
        advancementCondition,
        ...(round.numGroups && {
          scrambleSetCount:
            parseInt(round.numGroups || "0") + numSimulGroups + 1,
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
}: {
  scheduleEntry: WithTime<ScheduleEntry & { nonSimulScheduledTimeMs: number }>;
  events: Events;
  simulGroupsWithTimes: Array<WithTime<SimulGroup>>;
  getNextId: () => number;
}) => {
  if (scheduleEntry.type !== "event") {
    return [];
  }

  const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];

  if (!round) {
    return [];
  }

  const simulGroups = simulGroupsWithTimes.filter(
    (simulGroup) =>
      simulGroup.mainRound.eventId === scheduleEntry.eventId &&
      simulGroup.mainRound.roundNum === scheduleEntry.roundNum
  );

  const numGroups = parseInt(round.numGroups);
  const timePerGroupMs = scheduleEntry.nonSimulScheduledTimeMs / numGroups;
  const startTimeMs = scheduleEntry.startTime.getTime();
  const nonSimulGroups = range(numGroups).map((i) => ({
    startTime: new Date(startTimeMs + i * timePerGroupMs),
    endTime: new Date(startTimeMs + (i + 1) * timePerGroupMs),
  }));

  const allChildGroups = [...simulGroups, ...nonSimulGroups];
  allChildGroups.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return allChildGroups.map((childGroup, i) => ({
    id: getNextId(),
    name: `${LONG_EVENT_NAMES[scheduleEntry.eventId]}, Round ${
      scheduleEntry.roundNum + 1
    }, Group ${i + 1}`,
    activityCode: `${scheduleEntry.eventId}-r${scheduleEntry.roundNum + 1}-g${
      i + 1
    }`,
    startTime: childGroup.startTime.toISOString(),
    endTime: childGroup.endTime.toISOString(),
    childActivities: [],
    scrambleSetId: null,
    extensions: [],
  }));
};

const createWcifRoom = ({
  scheduleWithTimes,
  originalWcifRoom,
  startingId = 1,
  stationsPerRoom,
  simulGroupsWithTimes,
  events,
}: {
  scheduleWithTimes: ScheduleWithTimes;
  originalWcifRoom: WcifRoom;
  startingId: number;
  stationsPerRoom: number;
  simulGroupsWithTimes: Array<WithTime<SimulGroup>>;
  events: Events;
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

      const childActivities = createChildActivities({
        scheduleEntry,
        events,
        simulGroupsWithTimes,
        getNextId,
      });

      return {
        ...(originalActivity
          ? originalActivity
          : {
              name: constructActivityString(scheduleEntry),
              activityCode,
              childActivities,
              scrambleSetId: null,
              extensions: [],
            }),
        id: getNextId(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
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

  const simulGroupsWithTimes = calcSimulGroupsWithTimes(
    scheduleWithTimes,
    events
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
            simulGroupsWithTimes,
            events,
          })
        ),
      },
    ],
    numberOfDays,
  };
};

export const getNumberOfActivities = (wcifSchedule: WcifSchedule) => {
  const defaultVenue: Venue | undefined = wcifSchedule.venues?.[0];
  const defaultRoom: Room | undefined = defaultVenue?.rooms?.[0];
  const defaultActivities = defaultRoom?.activities;

  const rooms = wcifSchedule.venues?.flatMap((venue) => venue.rooms) || [];
  const allActivities = rooms?.flatMap((room) => room.activities);

  const numOtherActivities = {} as Record<OtherActivity, string>;
  OTHER_ACTIVITES.forEach((activity) => {
    numOtherActivities[activity] = "0";

    if (defaultActivities) {
      const numDefault = defaultActivities.filter(({ activityCode }) =>
        activityCode.startsWith(`other-${activity}`)
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

      otherActivities[otherActivity] = `${Math.floor(
        wcifScheduledTime / 1000 / 60
      )}`;
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
