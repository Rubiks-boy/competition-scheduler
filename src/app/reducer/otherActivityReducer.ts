import { range } from "../../utils/utils";
import type { Reducer } from "../types";

export const otherActivityReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "OTHER_ACTIVITY_TIME_SET":
      return {
        ...state,
        isShowingDefaultInfo: false,
        otherActivities: {
          ...state.otherActivities,
          [action.activity]: action.time,
        },
        isExported: false,
      };

    case "OTHER_ACTIVITY_NUMBER_CHANGED":
      const currentNumberOfActivity = parseInt(
        state.numOtherActivities[action.activity]
      );
      const newNumberOfActivity = parseInt(action.numberOfActivity);

      if (currentNumberOfActivity >= newNumberOfActivity) {
        return {
          ...state,
          isShowingDefaultInfo: false,
          numOtherActivities: {
            ...state.numOtherActivities,
            [action.activity]: action.numberOfActivity,
          },
          isExported: false,
          schedule: state.schedule.filter(
            (scheduleEntry) =>
              scheduleEntry.type !== "other" ||
              scheduleEntry.eventId !== action.activity ||
              scheduleEntry.index < newNumberOfActivity
          ),
        };
      } else {
        const newOtherActivity = range(
          currentNumberOfActivity,
          newNumberOfActivity
        ).map((index) => ({
          type: "other" as const,
          eventId: action.activity,
          index,
        }));

        return {
          ...state,
          isShowingDefaultInfo: false,
          numOtherActivities: {
            ...state.numOtherActivities,
            [action.activity]: action.numberOfActivity,
          },
          isExported: false,
          schedule: [...state.schedule, ...newOtherActivity],
        };
      }

    case "OTHER_ACTIVITY_ENABLED":
      const prevNumOfActivity = parseInt(
        state.numOtherActivities[action.activity]
      );
      const enabledNumberOfActivity =
        prevNumOfActivity > 0 ? prevNumOfActivity : 1;

      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: [
          ...state.schedule,
          ...range(enabledNumberOfActivity).map((index) => ({
            type: "other" as const,
            eventId: action.activity,
            index,
          })),
        ],
        numOtherActivities: {
          ...state.numOtherActivities,
          [action.activity]: `${enabledNumberOfActivity}`,
        },
        isExported: false,
      };

    case "OTHER_ACTIVITY_DISABLED":
      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: state.schedule.filter(
          (scheduleEntry) =>
            scheduleEntry.type !== "other" ||
            scheduleEntry.eventId !== action.activity
        ),
        isExported: false,
      };

    default:
      return state;
  }
};
