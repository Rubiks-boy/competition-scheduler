import { reorderFromWcif } from "../../utils/wcif";
import type { Reducer } from "../types";

export const scheduleReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "REORDER_ROUND":
      const { oldIndex, newIndex } = action;

      const reorderedSchedule = [...state.schedule];
      reorderedSchedule.splice(
        newIndex,
        0,
        reorderedSchedule.splice(oldIndex, 1)[0]
      );

      return {
        ...state,
        hasReorderedEvents: true,
        isShowingDefaultInfo: false,
        schedule: reorderedSchedule,
        isExported: false,
      };

    case "RESET_SCHEDULE":
      return {
        ...state,
        // Trigger withAutoScheduleReordering() to do its magic
        hasReorderedEvents: false,
      };

    case "REIMPORT_SCHEDULE_FROM_WCIF":
      if (!state.wcif) {
        return state;
      }
      return {
        ...state,
        hasReorderedEvents: true,
        schedule: reorderFromWcif({
          schedule: state.schedule,
          wcifSchedule: state.wcif.schedule,
          firstStartTime: state.startTimes[0],
        }),
      };

    case "START_TIME_CHANGED":
      const { startTime, dayIndex } = action;

      let newStartTimes;
      if (dayIndex === -1) {
        // Change all
        newStartTimes = state.startTimes.map(() => startTime);
      } else {
        newStartTimes = [...state.startTimes];
        newStartTimes.splice(dayIndex, 1, startTime);
      }
      return {
        ...state,
        isShowingDefaultInfo: false,
        startTimes: newStartTimes,
        isExported: false,
      };

    default:
      return state;
  }
};
