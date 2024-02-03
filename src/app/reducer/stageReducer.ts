import { STAGE_NAMES_AND_COLORS } from "../../constants";
import type { Reducer } from "../types";

export const stageReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "VENUE_NAME_CHANGED":
      return {
        ...state,
        venueName: action.venueName,
        isExported: false,
      };

    case "STAGE_CHECKED": {
      if (action.checked) {
        return {
          ...state,
          stages: [...state.stages, action.stage],
          isExported: false,
        };
      }

      return {
        ...state,
        stages: state.stages.filter((prevStage) => prevStage !== action.stage),
      };
    }

    case "USING_CUSTOM_STAGES_TOGGLED": {
      return {
        ...state,
        isUsingCustomStages: action.isUsingCustomStages,
        isExported: false,
      };
    }

    case "ADD_CUSTOM_STAGE": {
      const newCustomStageNum = state.customStages.length + 1;
      return {
        ...state,
        customStages: [
          ...state.customStages,
          {
            stage: `Stage ${newCustomStageNum}`,
            color: STAGE_NAMES_AND_COLORS.map(({ color }) => color)[
              newCustomStageNum % STAGE_NAMES_AND_COLORS.length
            ],
          },
        ],
        isExported: false,
      };
    }

    case "REMOVE_CUSTOM_STAGE": {
      return {
        ...state,
        customStages: state.customStages.filter((_, i) => i !== action.index),
        isExported: false,
      };
    }

    case "CUSTOM_STAGE_CHANGED": {
      return {
        ...state,
        customStages: state.customStages.map((stage, i) =>
          i === action.index ? action.customStage : stage
        ),
        isExported: false,
      };
    }

    default:
      return state;
  }
};
