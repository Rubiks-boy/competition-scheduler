import { getColorForStage, OTHER_ACTIVITES } from "../constants";
import { EventId, EVENT_IDS, Round } from "../types";
import { calcNumGroups, calcTimeForRound } from "../utils/calculators";
import { deepEquals } from "../utils/utils";
import {
  getDefaultEventsData,
  getDefaultSchedule,
  reorderFromWcif,
} from "../utils/wcif";
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

export const roundSelector =
  (eventId: EventId, roundNum: number) =>
  (state: State): Round | null => {
    const events = eventsSelector(state);
    return events[eventId]?.[roundNum] ?? null;
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

    return rounds.map((round) => round.scheduledTime);
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

export const inverseSimulGroupsSelector =
  (eventId: EventId, roundNum: number) =>
  (state: State): Array<Round & { roundNum: number }> => {
    const events = eventsSelector(state);

    const containsSimulGroup = ({ simulGroups }: Round) =>
      simulGroups.some(
        (simulGroup) =>
          simulGroup.mainRound.eventId === eventId &&
          simulGroup.mainRound.roundNum === roundNum
      );

    return Object.values(events).flatMap((rounds) =>
      rounds
        ? rounds
            .map((round, i) => ({ roundNum: i, ...round }))
            .filter(containsSimulGroup)
        : []
    );
  };
