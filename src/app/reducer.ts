import { STAGE_NAMES_AND_COLORS } from "../constants";
import { Round } from "../types";
import { autoReorder } from "../utils/autoReorder";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "../utils/calculators";
import { makeDefaultEvents } from "../utils/utils";
import {
  getDefaultEventsData,
  getDefaultNumStations,
  getDefaultSchedule,
  getNumStationsFromWcif,
} from "../utils/wcif";
import type { State, Action } from "./types";

export const initialState: State = {
  accessToken: null,
  manageableCompsPending: false,
  manageableComps: [],
  selectedCompId: null,
  competitorLimit: null,
  isNumStationsTouched: false,
  numStations: "8",
  startTime: new Date(0),
  wcifPending: false,
  wcif: null,
  isShowingDefaultInfo: true,
  hasReorderedEvents: false,
  events: makeDefaultEvents(),
  schedule: [],
  otherActivities: {
    registration: "30",
    checkin: "30",
    tutorial: "15",
    lunch: "45",
    awards: "15",
  },
  venueName: "",
  stages: ["Red", "Blue"],
  isUsingCustomStages: false,
  customStages: [{ stage: "Stage 1", color: STAGE_NAMES_AND_COLORS[1].color }],
  importSource: null,
  activeStep: 0,
  isExported: false,
};

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "SIGNIN_COMPLETE":
      const { accessToken } = action;
      return { ...state, accessToken };

    case "MANAGEABLE_COMPS_PENDING":
      return { ...state, manageableCompsPending: true };
    case "MANAGEABLE_COMPS_SUCCESS":
      const { manageableComps } = action;
      return {
        ...state,
        manageableCompsPending: false,
        manageableComps,
        selectedCompId: state.importSource
          ? state.selectedCompId
          : manageableComps[0].id,
      };
    case "MANAGEABLE_COMPS_ERROR":
      return {
        ...state,
        manageableCompsPending: false,
        manageableComps: [],
        selectedCompId: null,
      };

    case "FETCH_WCIF_PENDING":
      return { ...state, wcifPending: true };
    case "FETCH_WCIF_SUCCESS":
      const { wcif } = action;
      const defaultCompetitorLimit = wcif.competitorLimit || 120;
      const defaultNumStations =
        getNumStationsFromWcif(wcif) ||
        getDefaultNumStations(defaultCompetitorLimit);
      const events = getDefaultEventsData({
        wcif,
        numStations: defaultNumStations,
        competitorLimit: defaultCompetitorLimit,
      });

      const wcifStartTime = new Date(wcif.schedule.startDate);
      // Correct for the start date being in UTC
      if (wcifStartTime.getHours() < 12) {
        wcifStartTime.setHours(8, 0, 0, 0); // previous 8:00am
      } else {
        wcifStartTime.setHours(32, 0, 0, 0); // next 8:00am
      }

      if (state.importSource) {
        const startTimeWithWcifDate = new Date(wcifStartTime);
        startTimeWithWcifDate.setHours(
          state.startTime.getHours(),
          state.startTime.getMinutes()
        );

        return {
          ...state,
          wcifPending: false,
          wcif,
          startTime: startTimeWithWcifDate,
          // Fields below this point were added after import functionality was implemented
          // For backwards compatibility they also have to be able to fill in a default value if it doesn't exist.
          competitorLimit: state.competitorLimit || `${defaultCompetitorLimit}`,
        };
      }

      return {
        ...state,
        isShowingDefaultInfo: true,
        hasReorderedEvents: false,
        wcifPending: false,
        wcif,
        competitorLimit: `${defaultCompetitorLimit}`,
        isNumStationsTouched: false,
        numStations: `${defaultNumStations}`,
        events,
        schedule: getDefaultSchedule(events),
        startTime: wcifStartTime,
      };
    case "FETCH_WCIF_ERROR":
      return {
        ...state,
        wcifPending: false,
        wcif: null,
      };

    case "COMP_SELECTED":
      const { newId } = action;
      return {
        ...state,
        selectedCompId: newId,
        isExported: false,
      };

    case "COMPETITOR_LIMIT_CHANGED":
      const { competitorLimit } = action;

      if (state.isNumStationsTouched || !state.wcif) {
        return { ...state, competitorLimit };
      }

      const newNumStations = getDefaultNumStations(parseInt(competitorLimit));

      if (!state.isShowingDefaultInfo) {
        return {
          ...state,
          competitorLimit,
          numStations: `${newNumStations}`,
        };
      }

      const newDefaultEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: newNumStations,
        competitorLimit: parseInt(competitorLimit),
      });

      return {
        ...state,
        competitorLimit,
        numStations: `${newNumStations}`,
        events: newDefaultEvents,
        schedule: getDefaultSchedule(newDefaultEvents),
        isExported: false,
      };

    case "NUM_STATIONS_CHANGED":
      const { numStations } = action;

      if (!state.isShowingDefaultInfo || !state.wcif) {
        return {
          ...state,
          numStations,
          isNumStationsTouched: true,
        };
      }

      const updatedDefaultEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: parseInt(numStations || "0"),
        competitorLimit: parseInt(state.competitorLimit || "0"),
      });

      return {
        ...state,
        numStations,
        isNumStationsTouched: true,
        events: updatedDefaultEvents,
        schedule: getDefaultSchedule(updatedDefaultEvents),
        isExported: false,
      };

    case "START_TIME_CHANGED":
      const { startTime } = action;
      return {
        ...state,
        isShowingDefaultInfo: false,
        startTime,
        isExported: false,
      };

    case "ROUND_UPDATED":
      const oldRound = state.events[action.eventId]?.[action.roundNum];

      if (!oldRound) {
        return state;
      }

      const updatedRound = {
        ...oldRound,
        numCompetitors: action.numCompetitors ?? oldRound.numCompetitors,
        numGroups: action.numGroups ?? oldRound.numGroups,
        scheduledTime: action.scheduledTime ?? oldRound.scheduledTime,
      };

      if (!action.isEditingTime && !action.scheduledTime) {
        updatedRound.scheduledTime = calcTimeForRound(
          action.eventId,
          parseInt(updatedRound.numGroups || "0")
        ).toString();
      }

      const updatedRounds = [...(state.events[action.eventId] ?? [])];
      updatedRounds[action.roundNum] = updatedRound;

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: updatedRounds,
        },
        isExported: false,
      };

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...(state.events[action.eventId] ?? [])];
      withoutRemovedRound.pop();

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: withoutRemovedRound,
        },
        schedule: [
          ...state.schedule.filter(
            (scheduleEntry) =>
              scheduleEntry.type !== "event" ||
              scheduleEntry.eventId !== action.eventId ||
              scheduleEntry.roundNum !== withoutRemovedRound.length
          ),
        ],
        isExported: false,
      };

    case "ADD_EVENTS":
      const eventsToAdd = action.eventIds.map((eventId) => {
        const numCompetitors = calcExpectedNumCompetitors(
          eventId,
          state.wcif?.competitorLimit || 0
        );
        const numGroups = calcNumGroups({
          eventId,
          numCompetitors,
          numStations: parseInt(state.numStations || "0"),
        });

        return {
          [eventId]: [
            {
              eventId,
              numCompetitors: numCompetitors.toString(),
              numGroups: numGroups.toString(),
              scheduledTime: calcTimeForRound(eventId, numGroups).toString(),
            },
          ],
        };
      });

      return {
        ...state,
        events: {
          ...state.events,
          ...Object.assign({}, ...eventsToAdd),
        },
        schedule: [
          ...state.schedule,
          ...action.eventIds.map((eventId) => ({
            type: "event" as const,
            eventId,
            roundNum: 0,
          })),
        ],
        isExported: false,
      };

    case "ADD_ROUND":
      const withAddedRound = [...(state.events[action.eventId] ?? [])];

      const numCompetitors = !withAddedRound.length
        ? calcExpectedNumCompetitors(
            action.eventId,
            state.wcif?.competitorLimit || 0
          )
        : 0;

      const numGroups = calcNumGroups({
        eventId: action.eventId,
        numCompetitors,
        numStations: parseInt(state.numStations || "0"),
      });

      const roundToAdd: Round = {
        eventId: action.eventId,
        numCompetitors: numCompetitors.toString(),
        numGroups: numGroups.toString(),
        scheduledTime: calcTimeForRound(action.eventId, numGroups).toString(),
      };

      withAddedRound.push(roundToAdd);

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: withAddedRound,
        },
        schedule: [
          ...state.schedule,
          {
            type: "event",
            eventId: action.eventId,
            roundNum: withAddedRound.length - 1,
          },
        ],
        isExported: false,
      };

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

    case "OTHER_ACTIVITY_TIME_SET":
      const { activity, time } = action;

      return {
        ...state,
        isShowingDefaultInfo: false,
        otherActivities: {
          ...state.otherActivities,
          [activity]: time,
        },
        isExported: false,
      };

    case "OTHER_ACTIVITY_ENABLED":
      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: [
          ...state.schedule,
          { type: "other", eventId: action.activity },
        ],
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

    case "IMPORT_APP_STATE": {
      const { source, appState } = action;

      console.log("Imported app state", source, appState);

      const stateAfterImport: State = {
        importSource: source,

        // From AlwaysImportableAppState
        selectedCompId: appState.selectedCompId,
        isNumStationsTouched: state.isNumStationsTouched,
        numStations: appState.numStations,
        startTime: new Date(appState.startTime),
        isShowingDefaultInfo: appState.isShowingDefaultInfo,
        hasReorderedEvents: appState.hasReorderedEvents,
        events: appState.events,
        schedule: appState.schedule,
        otherActivities: appState.otherActivities,
        venueName: appState.venueName,
        stages: appState.stages,

        // From ShareableState
        competitorLimit: appState.competitorLimit ?? state.competitorLimit,
        customStages: appState.customStages ?? state.customStages,
        isUsingCustomStages:
          appState.isUsingCustomStages ?? state.isUsingCustomStages,

        // Remaining state
        accessToken: state.accessToken,
        manageableCompsPending: state.manageableCompsPending,
        manageableComps: state.manageableComps,
        wcifPending: state.wcifPending,
        wcif: state.wcif,
        activeStep: state.activeStep,
        isExported: false,
      };

      return stateAfterImport;
    }

    case "SET_ACTIVE_STEP":
      return {
        ...state,
        activeStep: action.activeStep,
      };

    case "EXPORTED":
      return {
        ...state,
        isExported: true,
      };

    default:
      return state;
  }
};

const withAutoScheduleReordering =
  (reducer: Reducer): Reducer =>
  (state, action) => {
    const newState = reducer(state, action);

    if (newState.hasReorderedEvents) {
      return newState;
    }

    return { ...newState, schedule: autoReorder(newState.schedule) };
  };

export default withAutoScheduleReordering(reducer);
