import { getColorForStage, OTHER_ACTIVITES } from "../constants";
import type { ShareableState, State } from "./types";

export const accessTokenSelector = (state: State) => state.accessToken;

export const isSignedInSelector = (state: State) => !!state.accessToken;

export const manageableCompsSelector = (state: State) => state.manageableComps;

export const selectedCompSelector = (state: State) => {
  const { selectedCompId, manageableComps } = state;
  return manageableComps.find(({ id }) => id === selectedCompId);
};

export const manageableCompsPendingSelector = (state: State) =>
  state.manageableCompsPending;

export const competitionSelector = (state: State) =>
  state.manageableComps.find((comp) => comp.id === state.selectedCompId);

export const competitorLimitSelector = (state: State) =>
  state.competitorLimit || "120";

export const numStationsSelector = (state: State) => state.numStations;

export const startTimeSelector = (state: State) => state.startTime;

export const eventsSelector = (state: State) => state.events;

export const scheduleSelector = (state: State) => state.schedule;

export const otherActivitiesSelector = (state: State) => state.otherActivities;

export const enabledOtherActivitiesSelector = (state: State) =>
  OTHER_ACTIVITES.filter(
    (activity) =>
      state.schedule.findIndex(
        (scheduleEntry) =>
          scheduleEntry.type === "other" && scheduleEntry.eventId === activity
      ) > -1
  );

export const wcifSelector = (state: State) => state.wcif;

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

export const canAdvanceToNext = (state: State, activeStep: number) => {
  if (activeStep !== 3) {
    return true;
  }
  const hasVenueName =
    !!wcifScheduleSelector(state)?.venues.length || state.venueName;

  const numRooms = wcifScheduleSelector(state)?.venues?.[0]?.rooms.length || 0;

  const hasRooms = numRooms > 0 || stagesSelector(state).length > 0;

  return hasVenueName && hasRooms;
};

export const shareableAppStateSelector = (state: State): ShareableState => {
  const {
    selectedCompId,
    numStations,
    startTime,
    isShowingDefaultInfo,
    hasReorderedEvents,
    events,
    schedule,
    otherActivities,
    venueName,
    stages,
    isNumStationsTouched,
    competitorLimit,
    customStages,
    isUsingCustomStages,
  } = state;

  return {
    selectedCompId,
    numStations,
    startTime,
    isShowingDefaultInfo,
    hasReorderedEvents,
    events,
    schedule,
    otherActivities,
    venueName,
    stages,
    isNumStationsTouched,
    competitorLimit,
    customStages,
    isUsingCustomStages,
  };
};

export const importSourceSelector = (state: State) => state.importSource;

export const fromImportSelector = (state: State): boolean =>
  !!state.importSource;
