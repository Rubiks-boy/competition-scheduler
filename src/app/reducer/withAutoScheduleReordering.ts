import { autoReorder } from "../../utils/autoReorder";
import type { Reducer } from "../types";

export const withAutoScheduleReordering =
  (reducer: Reducer): Reducer =>
  (state, action) => {
    const newState = reducer(state, action);

    if (state.isDebugging) {
      const { type, ...restAction } = action;
      console.log("State", type, restAction, newState);
    }

    if (newState.hasReorderedEvents) {
      return newState;
    }

    return { ...newState, schedule: autoReorder(newState.schedule) };
  };
