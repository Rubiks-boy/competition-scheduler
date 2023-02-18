import { getDefaultRoundData } from "../utils/wcif";
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
  rounds: [],
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
      return {
        ...state,
        wcifPending: false,
        wcif,
        rounds: getDefaultRoundData({
          wcif,
          numStations: state.numStations,
        }),
      };
    case "FETCH_WCIF_ERROR":
      return {
        ...state,
        wcifPending: false,
        wcif: null,
        rounds: [],
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
      const newRound = {
        ...state.rounds[action.roundIndex],
        ...(action.numCompetitors && { numCompetitors: action.numCompetitors }),
        ...(action.numGroups && { numGroups: action.numGroups }),
        ...(action.scheduledTime && { scheduledTime: action.scheduledTime }),
      };

      const updatedRounds = [...state.rounds];
      updatedRounds[action.roundIndex] = newRound;

      return {
        ...state,
        rounds: updatedRounds,
      };

    case "REMOVE_ROUND":
      const withoutRemovedRound = [...state.rounds];
      withoutRemovedRound.splice(action.roundIndex, 1);

      return {
        ...state,
        rounds: withoutRemovedRound,
      };

    case "ADD_ROUND":
      const withAddedRound = [...state.rounds];
      withAddedRound.splice(action.afterIndex + 1, 0, {
        eventId: action.eventId,
        numCompetitors: null,
        numGroups: null,
        scheduledTime: null,
      });

      return {
        ...state,
        rounds: withAddedRound,
      };

    case "REORDER_ROUND":
      const { oldIndex, newIndex } = action;

      const reorderedRounds = [...state.rounds];
      reorderedRounds.splice(
        newIndex,
        0,
        reorderedRounds.splice(oldIndex, 1)[0]
      );

      return {
        ...state,
        rounds: reorderedRounds,
      };

    default:
      return state;
  }
};
