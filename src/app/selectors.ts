import { OTHER_ACTIVITES } from "../constants";
import type { State } from "./types";

export const accessTokenSelector = (state: State) => state.accessToken;

export const isSignedInSelector = (state: State) => !!state.accessToken;

export const manageableCompsSelector = (state: State) => state.manageableComps;

export const selectedCompSelector = (state: State) => {
  const { selectedCompId, manageableComps } = state;
  return manageableComps.find(({ id }) => id === selectedCompId);
};

export const manageableCompsPendingSelector = (state: State) =>
  state.manageableCompsPending;

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
          scheduleEntry.type === "other" && scheduleEntry.activity === activity
      ) > -1
  );

export const wcifSelector = (state: State) => state.wcif;

export const wcifEventsSelector = (state: State) =>
  wcifSelector(state)?.events || [];

export const wcifScheduleSelector = (state: State) =>
  wcifSelector(state)?.schedule;
