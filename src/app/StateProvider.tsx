import React, { createContext, ReactNode, useReducer } from "react";
import { initialState } from "./initialState";
import reducer from "./reducer";
import type { Action } from "./types";

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
