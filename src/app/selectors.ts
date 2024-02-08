import { getColorForStage, OTHER_ACTIVITES } from "../constants";
import { EventId, EVENT_IDS, OtherActivity, Round } from "../types";
import { calcNumGroups, calcTimeForRound } from "../utils/calculators";
import { deepEquals } from "../utils/utils";
import {
  getDefaultEventsData,
  getDefaultSchedule,
  reorderFromWcif,
} from "../utils/wcif";
import { getRoundName } from "./helpers";
import type { ShareableState, State } from "./types";

export const accessTokenSelector = (state: State) => state.accessToken;

export const isSignedInSelector = (state: State) => !!state.accessToken;

export const manageableCompsSelector = (state: State) => state.manageableComps;

export const selectedCompIdSelector = (state: State) => state.selectedCompId;

export const selectedCompSelector = (state: State) => {
  const { selectedCompId, manageableComps } = state;
  return manageableComps.find(({ id }) => id === selectedCompId);
};

export const manageableCompsPendingSelector = (state: State) =>
  state.manageableCompsPending;

export const competitionSelector = (state: State) =>
  state.manageableComps.find((comp) => comp.id === state.selectedCompId);

export const competitorLimitRawSelector = (state: State) =>
  state.competitorLimit ?? "120";
export const competitorLimitSelector = (state: State) =>
  parseInt(competitorLimitRawSelector(state));

export const numStationsRawSelector = (state: State) =>
  state.numStations ?? "0";
export const numStationsSelector = (state: State) =>
  parseInt(numStationsRawSelector(state));

export const numberOfDaysRawSelector = (state: State) =>
  state.numberOfDays ?? "1";
export const numberOfDaysSelector = (state: State) =>
  parseInt(numberOfDaysRawSelector(state));

export const startTimesSelector = (state: State) => state.startTimes;

export const eventsSelector = (state: State) => state.events;

export const getRoundSelector =
  (state: State) =>
  ({
    eventId,
    roundNum,
  }: {
    eventId: EventId | OtherActivity;
    roundNum?: number;
  }): Round | null => {
    const events = eventsSelector(state);
    if (roundNum == null || !(eventId in events)) {
      return null;
    }
    return events[eventId as EventId]?.[roundNum] ?? null;
  };

export const addableEventIdsSelector = (state: State) => {
  const events = eventsSelector(state);
  return EVENT_IDS.filter((eventId) => events[eventId] === null);
};

export const scheduleSelector = (state: State) => state.schedule;

export const otherActivitiesSelector = (state: State) => state.otherActivities;

export const numOtherActivitiesSelector = (state: State) =>
  state.numOtherActivities;

export const enabledOtherActivitiesSelector = (state: State) =>
  OTHER_ACTIVITES.filter(
    (activity) =>
      state.schedule.findIndex(
        (scheduleEntry) =>
          scheduleEntry.type === "other" && scheduleEntry.eventId === activity
      ) > -1
  );

export const wcifSelector = (state: State) => state.wcif;

export const competitionNameSelector = (state: State) =>
  wcifSelector(state)?.name;

export const wcifEventsSelector = (state: State) =>
  wcifSelector(state)?.events || [];

export const wcifScheduleSelector = (state: State) =>
  wcifSelector(state)?.schedule;

export const venueNameSelector = (state: State) => state.venueName;

export const stagesSelector = (state: State) => state.stages;

export const customStagesSelector = (state: State) => state.customStages;

export const isUsingCustomStagesSelector = (state: State) =>
  state.isUsingCustomStages;

export const stagesInUseSelector = (state: State) => {
  if (isUsingCustomStagesSelector(state)) {
    return customStagesSelector(state);
  }

  return stagesSelector(state).map((stage) => ({
    stage: `${stage} Stage`,
    color: getColorForStage(stage),
  }));
};

export const isEventsPageValidSelector = (state: State) => {
  // Check that all the durations of each round are increments of 5 min
  const scheduledRoundTimes = Object.values(state.events).flatMap((rounds) => {
    if (!rounds) {
      return [];
    }

    return rounds.flatMap((round) => {
      if (round.type === "aggregate") {
        return round.scheduledTime;
      } else {
        return round.groups.map((g) => g.scheduledTime);
      }
    });
  });
  const scheduledOtherTimes = Object.values(state.otherActivities);
  const scheduledTimes = scheduledRoundTimes.concat(scheduledOtherTimes);
  return scheduledTimes.every((time) => parseInt(time) % 5 === 0);
};

const isVenuePageValid = (state: State) => {
  const hasVenueName =
    !!wcifScheduleSelector(state)?.venues.length || state.venueName;

  const numRooms = wcifScheduleSelector(state)?.venues?.[0]?.rooms.length || 0;

  const hasRooms = numRooms > 0 || stagesSelector(state).length > 0;

  return hasVenueName && hasRooms;
};

export const canAdvanceToNext = (state: State, activeStep: number) => {
  if (activeStep === 1) {
    return isEventsPageValidSelector(state);
  } else if (activeStep === 3) {
    return isVenuePageValid(state);
  } else {
    return true;
  }
};

export const shareableAppStateSelector = (state: State): ShareableState => {
  const {
    selectedCompId,
    numStations,
    startTimes,
    isShowingDefaultInfo,
    hasReorderedEvents,
    events,
    schedule,
    otherActivities,
    numOtherActivities,
    venueName,
    stages,
    isNumStationsTouched,
    competitorLimit,
    customStages,
    isUsingCustomStages,
    numberOfDays,
  } = state;

  return {
    selectedCompId,
    numStations,
    startTimes,
    isShowingDefaultInfo,
    hasReorderedEvents,
    events,
    schedule,
    otherActivities,
    numOtherActivities,
    venueName,
    stages,
    isNumStationsTouched,
    competitorLimit,
    customStages,
    isUsingCustomStages,
    numberOfDays,
  };
};

export const importSourceSelector = (state: State) => state.importSource;
export const isImportedFromUrlSelector = (state: State) =>
  state.importSource === "url";
export const isImportedFromLocalStorageSelector = (state: State) =>
  state.importSource === "local_storage";

export const activeStepSelector = (state: State) => state.activeStep;

export const isExportedSelector = (state: State) => state.isExported;

// TODO: Should store this in state
export const isUsingDefaultRoundsSelector = (state: State) => {
  const events = eventsSelector(state);
  const numStations = numStationsSelector(state);

  let isDefault = true;

  Object.entries(events).forEach(([eventId, rounds]) => {
    rounds?.forEach((round) => {
      if (round.type !== "aggregate") {
        return false;
      }

      const {
        totalNumCompetitors: numCompetitors,
        numGroups,
        scheduledTime,
      } = round;

      const defaultNumGroups = calcNumGroups({
        eventId: eventId as EventId,
        numCompetitors: parseInt(numCompetitors),
        numStations,
      });
      const defaultScheduledTime = calcTimeForRound(
        eventId as EventId,
        defaultNumGroups
      );

      if (
        parseInt(numGroups) !== defaultNumGroups ||
        parseInt(scheduledTime) !== defaultScheduledTime
      ) {
        isDefault = false;
      }
    });
  });

  return isDefault;
};

export const hasReorderedEventsSelector = (state: State) => {
  return state.hasReorderedEvents;
};

// Are events, including number of groups and scheduled time, same as WCIF
export const isEventsSameAsWcifSelector = (state: State) => {
  const wcif = wcifSelector(state);

  if (!wcif) {
    return true;
  }

  const defaultWcifEvents = getDefaultEventsData({
    wcif,
    numStations: numStationsSelector(state),
    competitorLimit: competitorLimitSelector(state),
  });

  const events = eventsSelector(state);

  return deepEquals(events, defaultWcifEvents);
};

// Just checks whether rounds were entirely added/removed, compared to the WCIF
export const isNumRoundsPerEventSameAsWcifSelector = (state: State) => {
  const wcif = wcifSelector(state);

  if (!wcif) {
    return true;
  }

  const defaultWcifEvents = getDefaultEventsData({
    wcif,
    numStations: numStationsSelector(state),
    competitorLimit: competitorLimitSelector(state),
  });

  const events = eventsSelector(state);

  return EVENT_IDS.every((eventId) => {
    const numWcifRounds = defaultWcifEvents[eventId]?.length ?? 0;
    const numRounds = events[eventId]?.length ?? 0;
    return numWcifRounds === numRounds;
  });
};

export const isScheduleSameAsWcifSelector = (state: State) => {
  const wcif = wcifSelector(state);

  if (!wcif) {
    return true;
  }

  const defaultWcifEvents = getDefaultEventsData({
    wcif,
    numStations: numStationsSelector(state),
    competitorLimit: competitorLimitSelector(state),
  });

  const startTimes = startTimesSelector(state);

  const defaultWcifSchedule = reorderFromWcif({
    schedule: getDefaultSchedule(
      defaultWcifEvents,
      numberOfDaysSelector(state),
      numOtherActivitiesSelector(state)
    ),
    wcifSchedule: wcif.schedule,
    firstStartTime: startTimes[0],
  });

  const schedule = scheduleSelector(state);

  return deepEquals(schedule, defaultWcifSchedule);
};

const acceptedRegistrationsSelector = (state: State) => {
  const { wcif } = state;
  if (!wcif) {
    return [];
  }

  return wcif.persons.filter(
    ({ registration }) =>
      registration &&
      registration.status === "accepted" &&
      // @ts-expect-error trust me bro
      registration.isCompeting
  );
};

export const numCompetitorsRegisteredSelector = (state: State) => {
  const acceptedRegistrations = acceptedRegistrationsSelector(state);

  return acceptedRegistrations.length;
};

export const numRegisteredByEventSelector = (state: State) => {
  const acceptedRegistrations = acceptedRegistrationsSelector(state);

  const numRegisteredByEvent = {} as Record<EventId, number>;
  EVENT_IDS.forEach((eventId) => {
    numRegisteredByEvent[eventId] = acceptedRegistrations.filter((person) =>
      person.registration?.eventIds.includes(eventId)
    ).length;
  });
  return numRegisteredByEvent;
};

type GroupIndicesForRound = Array<{
  correspondingMainEvent: {
    eventId: EventId;
    roundIndex: number;
    groupIndex: number;
  } | null;
  groupIndex: number;
}>;
const groupIndicesForRoundSelector = (
  state: State,
  { eventId, roundIndex }: { eventId: EventId; roundIndex: number }
): GroupIndicesForRound => {
  let currGroupIndex = 0;
  let result: GroupIndicesForRound = [];

  state.schedule.forEach((scheduleEntry) => {
    if (scheduleEntry.type !== "event") {
      return;
    }

    const round = getRoundSelector(state)(scheduleEntry);
    if (!round) {
      return;
    }

    if (
      eventId === scheduleEntry.eventId &&
      roundIndex === scheduleEntry.roundNum
    ) {
      result.push({
        correspondingMainEvent: null,
        groupIndex: currGroupIndex,
      });
      currGroupIndex +=
        round.type === "aggregate"
          ? parseInt(round.numGroups)
          : round.groups.length;
    }

    if (round.type === "groups") {
      round.groups.forEach((group, i) => {
        if (
          group.secondaryEvent &&
          group.secondaryEvent.eventId === eventId &&
          group.secondaryEvent.roundIndex === roundIndex
        ) {
          result.push({
            correspondingMainEvent: {
              eventId: scheduleEntry.eventId,
              roundIndex: scheduleEntry.roundNum,
              groupIndex: i,
            },
            groupIndex: currGroupIndex++,
          });
        }
      });
    }
  });

  return result;
};

export const groupIndexSelector = (
  state: State,
  {
    eventId,
    roundIndex,
    secondaryEventUnder,
  }: {
    eventId: EventId;
    roundIndex: number;
    secondaryEventUnder?: {
      eventId: EventId;
      roundIndex: number;
      groupIndex: number;
    } | null;
  }
): number | null => {
  const groupIndicesForRound = groupIndicesForRoundSelector(state, {
    eventId,
    roundIndex,
  });

  return (
    groupIndicesForRound.find((g) =>
      deepEquals(g.correspondingMainEvent, secondaryEventUnder ?? null)
    )?.groupIndex ?? null
  );
};

export const enableExperimentalFeaturesSelector = (state: State) =>
  state.experimentalFeaturesEnabled;

export const getRoundNameSelector =
  (state: State) =>
  ({ eventId, roundIndex }: { eventId: EventId; roundIndex: number }) => {
    const events = eventsSelector(state);
    const numRounds = events[eventId as EventId]?.length ?? 0;
    const isFinal = roundIndex === numRounds - 1;

    return getRoundName(eventId, roundIndex, isFinal);
  };

export const getGroupNameSelector =
  (state: State) =>
  ({
    eventId,
    roundIndex,
    groupIndex = 0,
    secondaryEventUnder,
  }: {
    eventId: EventId;
    roundIndex: number;
    groupIndex?: number;
    secondaryEventUnder?: {
      eventId: EventId;
      roundIndex: number;
      groupIndex: number;
    } | null;
  }) => {
    const roundName = getRoundNameSelector(state)({ eventId, roundIndex });
    const trueStartingIndex =
      groupIndexSelector(state, {
        eventId,
        roundIndex,
        secondaryEventUnder,
      }) ?? 0;
    return `${roundName} Group ${trueStartingIndex + groupIndex + 1}`;
  };

export const showAdvancedSelector = (state: State) => state.showAdvanced;

type MainGroupEntry = {
  eventId: EventId;
  roundIndex: number;
  groupIndex: number;
};
export const getSimulGroupsForEventSelector =
  (state: State) =>
  ({
    eventId,
    roundIndex,
  }: {
    eventId: EventId;
    roundIndex: number;
  }): Array<MainGroupEntry> => {
    const events = eventsSelector(state);

    const simulGroups = [] as Array<MainGroupEntry>;
    Object.entries(events).forEach(([mainEventId, mainRounds]) => {
      mainRounds &&
        mainRounds.forEach((mainRound, mainRoundIndex) => {
          if (mainRound.type !== "groups") {
            return;
          }

          mainRound.groups.forEach(({ secondaryEvent }, mainGroupIndex) => {
            if (
              secondaryEvent &&
              secondaryEvent.eventId === eventId &&
              secondaryEvent.roundIndex === roundIndex
            ) {
              simulGroups.push({
                eventId: mainEventId as EventId,
                roundIndex: mainRoundIndex,
                groupIndex: mainGroupIndex,
              });
            }
          });
        });
    });

    return simulGroups;
  };
