import { LONG_EVENT_NAMES } from "../constants";
import {
  EventId,
  Events,
  EVENT_IDS,
  Round,
  ScheduleEntry,
  WcifPerson,
} from "../types";

export const pick = (obj: { [key: string]: any }, keys: Array<string>) =>
  keys.reduce((newObj, key) => ({ ...newObj, [key]: obj[key] }), {});

export const findNthOccurrence = <T>(
  arr: Array<T>,
  predicate: (item: T) => boolean,
  n: number
): T | undefined => {
  let remainingHits = n;

  for (let i = 0; i < arr.length; i++) {
    if (!predicate(arr[i])) {
      continue;
    }

    if (!--remainingHits) {
      return arr[i];
    }
  }

  return undefined;
};

// Similar to python's range() function. examples:
// range(3) => [0, 1, 2]
// range(1, 4) => [1, 2, 3]
export const range = (arg0: number, arg1?: number): ReadonlyArray<number> => {
  const size = arg1 ? arg1 - arg0 : arg0;
  const startAt = arg1 ? arg0 : 0;
  return [...Array(size).keys()].map((i) => i + startAt);
};

export const makeDefaultEvents = () =>
  EVENT_IDS.reduce(
    (events, eventId) => ({ ...events, [eventId]: null }),
    {} as Events
  );

export const constructActivityString = (scheduleEntry: ScheduleEntry) => {
  if (scheduleEntry.type === "event") {
    const { eventId, roundNum } = scheduleEntry;
    return `${LONG_EVENT_NAMES[eventId]}, Round ${roundNum + 1}`;
  }

  return (
    scheduleEntry.eventId.charAt(0).toUpperCase() +
    scheduleEntry.eventId.slice(1)
  );
};

export const deepEquals = (a: unknown, b: unknown) => {
  // null or undefined
  if (a == null || b == null) {
    return a === b;
  }

  // not objects -> direct comparison
  if (!(typeof a === "object") || !(typeof b === "object")) {
    return a === b;
  }

  // they're objects -> check num keys match
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  // check that each value for each key matches
  for (const key in a) {
    const a_value = (a as Record<string, unknown>)[key];
    const b_value = (b as Record<string, unknown>)[key];
    if (!deepEquals(a_value, b_value)) {
      return false;
    }
  }
  return true;
};

export const getNumCompetitorsValue = (round: Round) => {
  if (round.type === "aggregate") {
    return {
      value: parseInt(round.totalNumCompetitors),
      isPercent: round.totalNumCompetitors.endsWith("%"),
    };
  } else {
    return {
      value: round.groups.reduce(
        (s, g) => s + parseInt(g.numMainCompetitors),
        0
      ),
      isPercent: false,
    };
  }
};

export const getScheduledTimeMs = (round: Round) => {
  if (round.type === "aggregate") {
    return parseInt(round.scheduledTime) * 60 * 1000;
  } else {
    return (
      round.groups.reduce((s, g) => s + parseInt(g.scheduledTime), 0) *
      60 *
      1000
    );
  }
};

export const calcNumCompetitorsPerRound = (rounds: Array<Round>) => {
  const numCompetitorsValue = rounds.map(getNumCompetitorsValue);

  const numCompetitorsPerRound: Array<number> = [];
  numCompetitorsValue.forEach(({ isPercent, value }, roundNum) => {
    const numCopetitorsInt = isPercent
      ? Math.floor((numCompetitorsPerRound[roundNum - 1] * value) / 100)
      : value;

    numCompetitorsPerRound.push(numCopetitorsInt);
  });

  return numCompetitorsPerRound;
};

export const numPersonsRegisteredForEvent = (
  eventId: EventId,
  wcifPersons: Array<WcifPerson>
) =>
  wcifPersons.filter(
    ({ registration }) =>
      registration &&
      registration.status === "accepted" &&
      registration.eventIds.includes(eventId)
  ).length;

export const roundTo5Min = (num: number) => {
  return Math.round(num / 5) * 5;
};
