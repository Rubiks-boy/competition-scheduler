import { ONE_DAY_MS, STAGE_NAMES_AND_COLORS } from "../constants";
import { Round } from "../types";
import { autoReorder } from "../utils/autoReorder";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "../utils/calculators";
import { makeDefaultEvents, range } from "../utils/utils";
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
  startTimes: [new Date(0)],
  wcifPending: false,
  wcif: null,
  isShowingDefaultInfo: true,
  hasReorderedEvents: false,
  events: makeDefaultEvents(),
  schedule: [],
  otherActivities: {
    registration: "30",
    checkin: "30",
    tutorial: "20",
    lunch: "60",
    awards: "15",
  },
  numOtherActivities: {
    registration: "1",
    checkin: "1",
    tutorial: "1",
    lunch: "1",
    awards: "1",
  },
  venueName: "",
  stages: ["Red", "Blue"],
  isUsingCustomStages: false,
  customStages: [{ stage: "Stage 1", color: STAGE_NAMES_AND_COLORS[1].color }],
  importSource: null,
  activeStep: 0,
  isExported: false,
  numberOfDays: null,
  isDebugging: localStorage.getItem("ScheduleGenerator.debug") === "true",
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
          state.startTimes[0].getHours(),
          state.startTimes[0].getMinutes()
        );

        const startTimes = range(wcif.schedule.numberOfDays).map(
          (i) => new Date(startTimeWithWcifDate.getTime() + ONE_DAY_MS * i)
        );

        const numDaysDiff =
          wcif.schedule.numberOfDays - parseInt(state.numberOfDays || "1");
        let schedule = state.schedule;
        if (numDaysDiff > 0) {
          // Add day dividers
          schedule = [
            ...state.schedule,
            ...range(
              parseInt(state.numberOfDays || "1"),
              wcif.schedule.numberOfDays
            ).map((i) => ({ type: "day-divider" as const, dayIndex: i })),
          ];
        } else {
          // Remove day dividers
          schedule = state.schedule.filter(
            (e) =>
              e.type !== "day-divider" ||
              e.dayIndex < wcif.schedule.numberOfDays
          );
        }

        return {
          ...state,
          wcifPending: false,
          wcif,
          startTimes: startTimes,
          // Fields below this point were added after import functionality was implemented
          // For backwards compatibility they also have to be able to fill in a default value if it doesn't exist.
          competitorLimit: state.competitorLimit || `${defaultCompetitorLimit}`,
          numberOfDays: `${wcif.schedule.numberOfDays}`,
          schedule,
        };
      }

      const startTimes = range(wcif.schedule.numberOfDays).map(
        (_, i) => new Date(wcifStartTime.getTime() + ONE_DAY_MS * i)
      );

      return {
        ...state,
        isShowingDefaultInfo: true,
        hasReorderedEvents: false,
        wcifPending: false,
        wcif,
        competitorLimit: `${defaultCompetitorLimit}`,
        isNumStationsTouched: false,
        numStations: `${defaultNumStations}`,
        numberOfDays: `${wcif.schedule.numberOfDays}`,
        events,
        schedule: getDefaultSchedule(events, wcif.schedule.numberOfDays),
        startTimes,
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
        importSource: null,
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
        schedule: getDefaultSchedule(
          newDefaultEvents,
          parseInt(state.numberOfDays ?? "0")
        ),
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
        schedule: getDefaultSchedule(
          updatedDefaultEvents,
          parseInt(state.numberOfDays ?? "0")
        ),
        isExported: false,
      };

    case "NUMBER_OF_DAYS_CHANGED":
      const { numberOfDays } = action;

      const currentNumberOfDays = parseInt(state.numberOfDays || "1");
      const newNumberOfDays = parseInt(numberOfDays || "1");

      if (currentNumberOfDays >= newNumberOfDays) {
        // Remove day dividers
        return {
          ...state,
          isShowingDefaultInfo: false,
          numberOfDays,
          schedule: state.schedule.filter(
            (scheduleEntry) =>
              scheduleEntry.type !== "day-divider" ||
              scheduleEntry.dayIndex < newNumberOfDays
          ),
          startTimes: state.startTimes.slice(0, newNumberOfDays),
        };
      } else {
        const newDayDividers = range(currentNumberOfDays, newNumberOfDays).map(
          (dayIndex) => ({
            type: "day-divider" as const,
            dayIndex,
          })
        );

        return {
          ...state,
          isShowingDefaultInfo: false,
          numberOfDays,
          schedule: [...state.schedule, ...newDayDividers],
          startTimes: [
            ...state.startTimes,
            ...range(currentNumberOfDays, newNumberOfDays).map(
              (i) => new Date(state.startTimes[0].getTime() + i * ONE_DAY_MS)
            ),
          ],
        };
      }

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
      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: [
          ...state.schedule,
          ...range(parseInt(state.numOtherActivities[action.activity])).map(
            (index) => ({
              type: "other" as const,
              eventId: action.activity,
              index,
            })
          ),
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

      if (state.isDebugging) {
        console.log("Imported app state", source, appState);
      }

      const stateAfterImport: State = {
        importSource: source,

        // From AlwaysImportableAppState
        selectedCompId: appState.selectedCompId,
        isNumStationsTouched: state.isNumStationsTouched,
        numStations: appState.numStations,
        startTimes:
          appState.startTimes?.map((d) => new Date(d)) ?? state.startTimes,
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
        numberOfDays: appState.numberOfDays ?? state.numberOfDays,
        numOtherActivities:
          appState.numOtherActivities ?? state.numOtherActivities,

        // Remaining state
        accessToken: state.accessToken,
        manageableCompsPending: state.manageableCompsPending,
        manageableComps: state.manageableComps,
        wcifPending: state.wcifPending,
        wcif: state.wcif,
        activeStep: state.activeStep,
        isExported: false,
        isDebugging: state.isDebugging,
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

    if (state.isDebugging) {
      console.log("State update", action, newState);
    }

    if (newState.hasReorderedEvents) {
      return newState;
    }

    return { ...newState, schedule: autoReorder(newState.schedule) };
  };

export default withAutoScheduleReordering(reducer);
