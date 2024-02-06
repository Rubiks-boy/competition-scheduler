import type { EventId, SimulGroup } from "../types";
import { range } from "../utils/utils";
import { roundSelector } from "./selectors";
import type { Action, State } from "./types";

type StateModifier<T> = (state: State, action: Action & { type: T }) => State;

const removeSimulGroup = (
  state: State,
  eventId: EventId,
  roundNum: number,
  simulGroupMatches: (simulGroup: SimulGroup) => boolean
): { state: State; removedSimulGroup: SimulGroup | null } => {
  const prevRounds = state.events[eventId];
  if (!prevRounds) {
    return { state, removedSimulGroup: null };
  }
  const prevRound = prevRounds[roundNum];

  const simulGroup = prevRound.simulGroups.find(simulGroupMatches);

  if (!simulGroup) {
    return { state, removedSimulGroup: null };
  }

  const newRound = {
    ...prevRound,
    simulGroups: [
      ...prevRound.simulGroups.filter(
        (simulGroup) => !simulGroupMatches(simulGroup)
      ),
    ],
  };

  const newRounds = [...prevRounds];
  newRounds[roundNum] = newRound;

  const newState = {
    ...state,
    isShowingDefaultInfo: false,
    isExported: false,
    events: {
      ...state.events,
      [eventId]: newRounds,
    },
  };
  return { state: newState, removedSimulGroup: simulGroup };
};

const addSimulGroup = (
  state: State,
  eventId: EventId,
  roundNum: number,
  simulGroup: SimulGroup
): State => {
  const prevRounds = state.events[eventId];
  if (!prevRounds) {
    return state;
  }
  const prevRound = prevRounds[roundNum];

  const newRound = {
    ...prevRound,
    simulGroups: [...prevRound.simulGroups, simulGroup],
  };

  const newRounds = [...prevRounds];
  newRounds[roundNum] = newRound;

  return {
    ...state,
    isShowingDefaultInfo: false,
    isExported: false,
    events: {
      ...state.events,
      [eventId]: newRounds,
    },
  };
};

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

  const currRound = roundSelector(
    destScheduleEntry.eventId,
    destScheduleEntry.roundNum
  )(state);

  if (!currRound) {
    return state;
  }

  const currSimulGroupNums = currRound.simulGroups.map(
    (simulGroup) => simulGroup.groupOffset
  );

  const firstAvailableGroupOffset = range(parseInt(currRound.numGroups)).find(
    (i) => !currSimulGroupNums.includes(i)
  );

  if (firstAvailableGroupOffset === undefined) {
    // All groups have a simul event
    return state;
  }

  const newSimulGroup = {
    mainRound: {
      eventId: sourceScheduleEntry.eventId,
      roundNum: sourceScheduleEntry.roundNum,
      numCompetitors: "10",
      scheduledTime: "20",
    },
    groupOffset: firstAvailableGroupOffset,
    numCompetitors: "30",
  };

  return addSimulGroup(
    state,
    destScheduleEntry.eventId,
    destScheduleEntry.roundNum,
    newSimulGroup
  );
};

export const updateSimulRound: StateModifier<"UPDATE_SIMUL_ROUND"> = (
  state,
  action
) => {
  const simulGroupMatches = (simulGroup: SimulGroup) =>
    simulGroup.mainRound.eventId === action.mainRound.eventId &&
    simulGroup.mainRound.roundNum === action.mainRound.roundNum;

  const { state: stateWithoutOldSimulGroup, removedSimulGroup } =
    removeSimulGroup(state, action.eventId, action.roundNum, simulGroupMatches);

  if (!removedSimulGroup) {
    return state;
  }

  const newSimulGroup = {
    ...removedSimulGroup,
    mainRound: {
      ...removedSimulGroup.mainRound,
      numCompetitors:
        action.numMainCompetitors ?? removedSimulGroup.mainRound.numCompetitors,
      scheduledTime:
        action.scheduledTime ?? removedSimulGroup.mainRound.scheduledTime,
    },
    numCompetitors: action.numCompetitors ?? removedSimulGroup.numCompetitors,
  };

  return addSimulGroup(
    stateWithoutOldSimulGroup,
    action.eventId,
    action.roundNum,
    newSimulGroup
  );
};

export const reorderSimulGroup: StateModifier<"REORDER_SIMUL_GROUP"> = (
  state,
  action
) => {
  const { state: stateWithoutOldSimulGroup, removedSimulGroup } =
    removeSimulGroup(
      state,
      action.startingRound.eventId,
      action.startingRound.roundNum,
      (simulGroup) => simulGroup.groupOffset === action.startingGroupOffset
    );

  if (!removedSimulGroup) {
    return state;
  }

  if (action.endingRound.eventId === removedSimulGroup.mainRound.eventId) {
    return stateWithoutOldSimulGroup;
  }

  const newSimulGroup = {
    ...removedSimulGroup,
    groupOffset: action.newGroupOffset,
  };

  return addSimulGroup(
    stateWithoutOldSimulGroup,
    action.endingRound.eventId,
    action.endingRound.roundNum,
    newSimulGroup
  );
};
