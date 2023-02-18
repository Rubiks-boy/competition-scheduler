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

export const roundsSelector = (state: State) => state.rounds;

export const wcifSelector = (state: State) => state.wcif;

export const wcifEventsSelector = (state: State) =>
  wcifSelector(state)?.events || [];
