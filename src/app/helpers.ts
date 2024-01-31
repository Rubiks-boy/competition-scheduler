import type { Round } from "../types";
import type { Action, State } from "./types";

type StateModifier<T> = (state: State, action: Action & { type: T }) => State;

export const createSimulRound: StateModifier<"CREATE_SIMUL_ROUND"> = (
  state,
  action
) => {
  const sourceScheduleEntry = state.schedule[action.sourceIndex];
  const destScheduleEntry = state.schedule[action.destinationIndex];
  if (
    sourceScheduleEntry.type !== "event" ||
    destScheduleEntry.type !== "event"
  ) {
    return state;
  }

  const prevRounds = state.events[sourceScheduleEntry.eventId];
  if (!prevRounds) {
    return state;
  }

  const prevRound = prevRounds[sourceScheduleEntry.roundNum];

  if (prevRound.simulGroups.length) {
    return state;
  }

  const newRound: Round = {
    ...prevRound,
    simulGroups: [
      {
        mainRound: {
          eventId: destScheduleEntry.eventId,
          roundNum: destScheduleEntry.roundNum,
          numGroups: "1",
          numCompetitors: "0",
          scheduledTime: "0",
        },
        groupOffset: 0,
        numCompetitors: "0",
      },
    ],
  };

  const newRounds = [...prevRounds];
  newRounds[sourceScheduleEntry.roundNum] = newRound;

  return {
    ...state,
    isShowingDefaultInfo: false,
    events: {
      ...state.events,
      [sourceScheduleEntry.eventId]: newRounds,
    },
    isExported: false,
  };
};

export const updateSimulRound: StateModifier<"UPDATE_SIMUL_ROUND"> = (
  state,
  action
) => {
  const prevRounds = state.events[action.eventId];
  if (!prevRounds) {
    return state;
  }
  const prevRound = prevRounds[action.roundNum];
  const prevSimulGroup = prevRound.simulGroups.find(
    (simulGroup) =>
      simulGroup.mainRound.eventId === action.mainRound.eventId &&
      simulGroup.mainRound.roundNum === action.mainRound.roundNum
  );

  if (!prevSimulGroup) {
    return state;
  }

  const newSimulGroup = {
    ...prevSimulGroup,
    mainRound: {
      ...prevSimulGroup.mainRound,
      numGroups: action.numGroups ?? prevSimulGroup.mainRound.numGroups,
      numCompetitors:
        action.numMainCompetitors ?? prevSimulGroup.mainRound.numCompetitors,
      scheduledTime:
        action.scheduledTime ?? prevSimulGroup.mainRound.scheduledTime,
    },
    groupOffset: action.groupOffset ?? prevSimulGroup.groupOffset,
    numCompetitors: action.numCompetitors ?? prevSimulGroup.numCompetitors,
  };

  const newRound = {
    ...prevRound,
    simulGroups: [
      ...prevRound.simulGroups.filter(
        (simulGroup) =>
          simulGroup.mainRound.eventId !== action.mainRound.eventId ||
          simulGroup.mainRound.roundNum !== action.mainRound.roundNum
      ),
      newSimulGroup,
    ],
  };

  const newRounds = [...prevRounds];
  newRounds[action.roundNum] = newRound;

  return {
    ...state,
    isShowingDefaultInfo: false,
    events: {
      ...state.events,
      [action.eventId]: newRounds,
    },
    isExported: false,
  };
};
