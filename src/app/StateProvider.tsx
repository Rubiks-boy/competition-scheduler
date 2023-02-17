import React, { createContext, ReactNode, useReducer } from "react";
import { reducer } from "./reducer";
import type { Action, State } from "./types";

const initialState: State = {
  accessToken: null,
  manageableCompsPending: false,
  manageableComps: [],
  selectedCompId: null,
  numStations: 8,
  startTime: new Date(1000 * 60 * 60 * 17),
  wcifPending: false,
  wcif: null,
};

export const StateContext = createContext({
  state: initialState,
  dispatch: (_: Action) => {},
});

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};
