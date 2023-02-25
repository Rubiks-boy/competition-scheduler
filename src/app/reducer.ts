import { Round } from "../types";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "../utils/calculators";
import { makeDefaultEvents } from "../utils/utils";
import { getDefaultEventsData, getDefaultSchedule } from "../utils/wcif";
import type { State, Action } from "./types";

export const initialState: State = {
  accessToken: null,
  manageableCompsPending: false,
  manageableComps: [],
  selectedCompId: null,
  numStations: "8",
  startTime: new Date(0),
  wcifPending: false,
  wcif: null,
  isShowingDefaultInfo: true,
  events: makeDefaultEvents(),
  schedule: [],
  otherActivities: {
    registration: "30",
    checkin: "30",
    tutorial: "15",
    lunch: "45",
    awards: "15",
  },
};

export const reducer = (state: State, action: Action): State => {
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
        selectedCompId: manageableComps[0].id,
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
      const events = getDefaultEventsData({
        wcif,
        numStations: parseInt(state.numStations || "0"),
      });

      const wcifStartTime = new Date(wcif.schedule.startDate);
      // Correct for the start date being in UTC
      if (wcifStartTime.getHours() < 12) {
        wcifStartTime.setHours(8, 0, 0, 0); // previous 8:00am
      } else {
        wcifStartTime.setHours(32, 0, 0, 0); // next 8:00am
      }

      return {
        ...state,
        isShowingDefaultInfo: true,
        wcifPending: false,
        wcif,
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
      };

    case "NUM_STATIONS_CHANGED":
      const { numStations } = action;

      if (!state.isShowingDefaultInfo || !state.wcif) {
        return {
          ...state,
          numStations,
        };
      }

      const updatedDefaultEvents = getDefaultEventsData({
        wcif: state.wcif,
        numStations: parseInt(numStations || "0"),
      });

      return {
        ...state,
        numStations,
        events: updatedDefaultEvents,
        schedule: getDefaultSchedule(updatedDefaultEvents),
      };

    case "START_TIME_CHANGED":
      const { startTime } = action;
      return {
        ...state,
        isShowingDefaultInfo: false,
        startTime,
      };

    case "ROUND_UPDATED":
      const oldRound = state.events[action.eventId][action.roundNum];

      if (!oldRound) {
        return state;
      }

      const updatedRound = {
        ...oldRound,
        ...(action.numCompetitors && { numCompetitors: action.numCompetitors }),
        ...(action.numGroups && { numGroups: action.numGroups }),
        ...(action.scheduledTime && { scheduledTime: action.scheduledTime }),
      };

      if (!action.isEditingTime && !action.scheduledTime) {
        updatedRound.scheduledTime = calcTimeForRound(
          action.eventId,
          parseInt(updatedRound.numGroups || "0")
        ).toString();
      }

      const updatedRounds = [...state.events[action.eventId]];
      updatedRounds[action.roundNum] = updatedRound;

      return {
        ...state,
        isShowingDefaultInfo: false,
        events: {
          ...state.events,
          [action.eventId]: updatedRounds,
        },
      };

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...state.events[action.eventId]];
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
      };

    case "ADD_ROUND":
      const withAddedRound = [...state.events[action.eventId]];

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
        isShowingDefaultInfo: false,
        schedule: reorderedSchedule,
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
      };

    case "OTHER_ACTIVITY_ENABLED":
      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: [
          ...state.schedule,
          { type: "other", activity: action.activity },
        ],
      };

    case "OTHER_ACTIVITY_DISABLED":
      return {
        ...state,
        isShowingDefaultInfo: false,
        schedule: state.schedule.filter(
          (scheduleEntry) =>
            scheduleEntry.type !== "other" ||
            scheduleEntry.activity !== action.activity
        ),
      };

    default:
      return state;
  }
};
