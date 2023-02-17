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
      const oldRoundIndex = state.rounds.findIndex(
        ({ eventId, roundNum }) =>
          eventId === action.eventId && roundNum === action.roundNum
      );

      if (oldRoundIndex === -1) {
        return state;
      }

      const newRound = {
        ...state.rounds[oldRoundIndex],
        ...(action.numCompetitors && { numCompetitors: action.numCompetitors }),
        ...(action.numGroups && { numGroups: action.numGroups }),
        ...(action.scheduledTime && { scheduledTime: action.scheduledTime }),
      };

      const updatedRounds = [...state.rounds];
      updatedRounds[oldRoundIndex] = newRound;

      return {
        ...state,
        rounds: updatedRounds,
      };

    case "REMOVE_ROUND":
      const newRounds = state.rounds
        // Remove the round
        .filter(
          ({ eventId, roundNum }) =>
            eventId !== action.eventId || roundNum !== action.roundNum
        )
        // Fix the index of subsequent rounds
        .map((round) => {
          const { eventId, roundNum } = round;
          if (eventId !== action.eventId || roundNum < action.roundNum) {
            return round;
          }

          return {
            ...round,
            roundNum: round.roundNum - 1,
          };
        });

      return {
        ...state,
        rounds: newRounds,
      };

    case "ADD_ROUND":
      // Index of the button the user pressed "+" on
      const currentRoundIndex = state.rounds.findIndex(
        ({ eventId, roundNum }) =>
          eventId === action.eventId && roundNum === action.roundNum - 1
      );

      if (currentRoundIndex === -1) {
        return state;
      }

      const withAddedRound = [...state.rounds] // Fix the index of subsequent rounds
        .map((round) => {
          const { eventId, roundNum } = round;
          if (eventId !== action.eventId || roundNum < action.roundNum) {
            return round;
          }

          return {
            ...round,
            roundNum: round.roundNum + 1,
          };
        });

      withAddedRound.splice(currentRoundIndex + 1, 0, {
        eventId: action.eventId,
        roundNum: action.roundNum,
        numCompetitors: null,
        numGroups: null,
        scheduledTime: null,
      });

      // TODO fix isFinalRound logic

      return {
        ...state,
        rounds: withAddedRound,
      };

    default:
      return state;
  }
};
