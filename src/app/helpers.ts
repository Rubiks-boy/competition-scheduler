import { EVENT_NAMES } from "../constants";
import type { EventId, Round, SecondaryEvent, SimulGroup } from "../types";
import { range, splitEvenlyWithRounding } from "../utils/utils";
import { getRoundSelector } from "./selectors";
import type { Action, State } from "./types";

type StateModifier<T> = (state: State, action: Action & { type: T }) => State;

const convertToGroupBased = (prevRound: Round): Round & { type: "groups" } => {
  if (prevRound.type === "groups") {
    return prevRound;
  }

  const numGroups = parseInt(prevRound.numGroups);
  const competitorsPerGroup = splitEvenlyWithRounding(
    parseInt(prevRound.totalNumCompetitors),
    numGroups,
    1
  );
  const timePerGroup = splitEvenlyWithRounding(
    parseInt(prevRound.scheduledTime),
    numGroups,
    5
  );
  const groups: Array<SimulGroup> = range(numGroups).map((i) => ({
    numMainCompetitors: `${competitorsPerGroup[i]}`,
    scheduledTime: `${timePerGroup[i]}`,
  }));

  const newRound: Round = {
    type: "groups",
    eventId: prevRound.eventId,
    groups,
  };

  return newRound;
};

const addSimulGroup = (
  state: State,
  eventId: EventId,
  roundNum: number,
  groupNum: number,
  secondaryEvent: SecondaryEvent
): State => {
  const prevRounds = state.events[eventId];
  if (!prevRounds) {
    return state;
  }
  const prevRound = convertToGroupBased(prevRounds[roundNum]);

  const groups = [...prevRound.groups];
  groups[groupNum] = {
    ...groups[groupNum],
    secondaryEvent,
  };

  const newRound = {
    ...prevRound,
    groups,
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

const modifyRoundInState = (
  state: State,
  action: { eventId: EventId; roundIndex: number },
  modifyRound: (prevRound: Round & { type: "groups" }) => Round
): State => {
  const prevRounds = state.events[action.eventId];
  if (!prevRounds) {
    return state;
  }
  const prevRound = prevRounds[action.roundIndex];
  if (!prevRound) {
    return state;
  }

  const newRound = modifyRound(convertToGroupBased(prevRound));

  const newRounds = [...prevRounds];
  newRounds[action.roundIndex] = newRound;

  return {
    ...state,
    isShowingDefaultInfo: false,
    isExported: false,
    events: {
      ...state.events,
      [action.eventId]: newRounds,
    },
  };
};

export const createSimulRound: StateModifier<"CREATE_SIMUL_GROUP"> = (
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

  const currRound = getRoundSelector(state)(destScheduleEntry);
  if (!currRound) {
    return state;
  }

  const firstAvailableGroupNum =
    currRound.type === "groups"
      ? currRound.groups.findIndex((g) => !g.secondaryEvent)
      : 0;

  if (firstAvailableGroupNum === -1) {
    // All groups have a simul event
    return state;
  }

  const secondaryEvent: SecondaryEvent = {
    eventId: sourceScheduleEntry.eventId,
    roundIndex: sourceScheduleEntry.roundNum,
    numCompetitors: "10",
  };

  return addSimulGroup(
    state,
    destScheduleEntry.eventId,
    destScheduleEntry.roundNum,
    firstAvailableGroupNum,
    secondaryEvent
  );
};

export const updateSimulRound: StateModifier<"UPDATE_SIMUL_GROUP"> = (
  state,
  action
) => {
  return modifyRoundInState(state, action, (prevRound) => {
    const groups = [...prevRound.groups];

    const prevGroup = prevRound.groups[action.groupIndex];
    groups[action.groupIndex] = {
      numMainCompetitors:
        action.numMainCompetitors ?? prevGroup.numMainCompetitors,
      scheduledTime: action.scheduledTime ?? prevGroup.scheduledTime,
      secondaryEvent: prevGroup.secondaryEvent
        ? {
            eventId: prevGroup.secondaryEvent.eventId,
            roundIndex: prevGroup.secondaryEvent.roundIndex,
            numCompetitors:
              action.numSecondaryCompetitors ??
              prevGroup.secondaryEvent.numCompetitors,
          }
        : undefined,
    };

    const newRound: Round = {
      ...prevRound,
      groups,
    };

    return newRound;
  });
};

export const reorderSimulGroup: StateModifier<"REORDER_SIMUL_GROUP"> = (
  state,
  action
) => {
  let oldSecondaryEvent: SecondaryEvent | undefined;

  const withoutOld = modifyRoundInState(
    state,
    {
      eventId: action.startingLocation.eventId,
      roundIndex: action.startingLocation.roundIndex,
    },
    (prevRound) => {
      const groups = [...prevRound.groups];
      oldSecondaryEvent =
        groups[action.startingLocation.groupIndex].secondaryEvent;
      groups[action.startingLocation.groupIndex].secondaryEvent = undefined;

      return {
        ...prevRound,
        groups,
      };
    }
  );

  const withNew = modifyRoundInState(
    withoutOld,
    {
      eventId: action.endingLocation.eventId,
      roundIndex: action.endingLocation.roundIndex,
    },
    (prevRound) => {
      const groups = [...prevRound.groups];
      groups[action.endingLocation.groupIndex].secondaryEvent =
        oldSecondaryEvent;

      return {
        ...prevRound,
        groups,
      };
    }
  );

  return withNew;
};

export const getRoundName = (
  eventId: EventId,
  roundNum: number,
  isFinal: boolean
) => `${EVENT_NAMES[eventId]} ${isFinal ? "Final" : `Round ${roundNum + 1}`}`;
