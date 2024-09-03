import { EventId, Events, EVENT_IDS, Round, WcifPerson } from "../types";

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

export const roundDownTo = (num: number, roundingAmount: number = 5) => {
  return Math.floor(num / roundingAmount) * roundingAmount;
};

// Tries to split `totalNum` evenly into `numEntries` chunks,
// making sure that each chunk is rounded to `roundAmount`
// and that the total of each chunk still adds perfectly to `totalNum`
// Examples:
// - splitEvenlyWithRounding(80, 4, 5) => [20, 20, 20, 20]
// - splitEvenlyWithRounding(85, 4, 5) => [25, 20, 20, 20]
// - splitEvenlyWithRounding(95, 3, 5) => [35, 30, 30]
export const splitEvenlyWithRounding = (
  totalNum: number,
  numEntries: number,
  roundingAmount: number = 5
) => {
  const idealSplit = roundDownTo(totalNum / numEntries, roundingAmount);
  const remainder = totalNum - idealSplit * numEntries;
  const numGroupsWithRemainder = remainder / roundingAmount;

  return range(numEntries).map(
    (i) => idealSplit + (i < numGroupsWithRemainder ? roundingAmount : 0)
  );
};

export const isOverlappingDates = (
  a: { startTime: Date; endTime: Date },
  b: { startTime: Date; endTime: Date }
) => {
  if (a.startTime.getTime() < b.startTime.getTime()) {
    return a.endTime.getTime() > b.startTime.getTime();
  } else {
    return a.startTime.getTime() < b.endTime.getTime();
  }
};
