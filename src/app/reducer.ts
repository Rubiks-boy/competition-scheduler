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
  numStations: 8,
  startTime: new Date(1000 * 60 * 60 * 17),
  wcifPending: false,
  wcif: null,
  events: makeDefaultEvents(),
  schedule: [],
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
        numStations: state.numStations,
      });

      return {
        ...state,
        wcifPending: false,
        wcif,
        events,
        schedule: getDefaultSchedule(events),
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
      return {
        ...state,
        numStations,
      };

    case "START_TIME_CHANGED":
      const { startTime } = action;
      return {
        ...state,
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

      return {
        ...state,
        events: {
          ...state.events,
          [action.eventId]: {
            ...state.events[action.eventId],
            [action.roundNum]: updatedRound,
          },
        },
      };

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...state.events[action.eventId]];
      withoutRemovedRound.pop();

      return {
        ...state,
        events: {
          ...state.events,
          [action.eventId]: withoutRemovedRound,
        },
        schedule: [
          ...state.schedule.filter(
            ({ eventId, roundNum }) =>
              eventId !== action.eventId ||
              roundNum !== withoutRemovedRound.length
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
        numStations: state.numStations,
      });

      const roundToAdd: Round = {
        eventId: action.eventId,
        numCompetitors,
        numGroups,
        scheduledTime: calcTimeForRound(action.eventId, numGroups),
      };

      withAddedRound.push(roundToAdd);

      return {
        ...state,
        events: {
          ...state.events,
          [action.eventId]: withAddedRound,
        },
        schedule: [
          ...state.schedule,
          { eventId: action.eventId, roundNum: withAddedRound.length - 1 },
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
        schedule: reorderedSchedule,
      };

    default:
      return state;
  }
};
