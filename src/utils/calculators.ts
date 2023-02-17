import {
  HISTORICAL_PNW_REGISTRATION,
  IDEAL_COMPETITORS_PER_STATION,
  TIME_PER_GROUP,
} from "../constants";
import { EventId, Round } from "../types";

export const compPerStationsRatio = (
  { numCompetitors, numGroups }: Round,
  numStations: number
) => {
  if (!numCompetitors || !numGroups) {
    return "";
  }

  return (numCompetitors / numGroups / numStations).toFixed(2);
};

export const calcTimeForRound = (
  eventId: EventId,
  numGroups: number | null
) => {
  const calculatedTime = TIME_PER_GROUP[eventId] * (numGroups || 0);

  // round up to the nearest 5 mins
  return Math.ceil(calculatedTime / 5) * 5;
};

export const calcExpectedNumCompetitors = (
  eventId: EventId,
  competitorLimit: number
) => Math.floor(competitorLimit * HISTORICAL_PNW_REGISTRATION[eventId]);

export const calcNumGroups = ({
  eventId,
  numCompetitors,
  numStations,
}: {
  eventId: EventId;
  numCompetitors: number;
  numStations: number;
}) => {
  const ratio = IDEAL_COMPETITORS_PER_STATION[eventId];

  const idealCompetitorsPerGroup = ratio * numStations;

  const numGroupsOptions = [
    Math.floor(numCompetitors / idealCompetitorsPerGroup),
    Math.ceil(numCompetitors / idealCompetitorsPerGroup),
  ];

  const optionsRatios = numGroupsOptions.map(
    (numGroups) => numCompetitors / numGroups / numStations
  );
  const diffsFromIdeal = optionsRatios.map((r) => Math.abs(r - ratio));

  return diffsFromIdeal[0] < diffsFromIdeal[1]
    ? numGroupsOptions[0]
    : numGroupsOptions[1];
};

export const calcRoundNum = (roundIndex: number, rounds: Array<Round>) => {
  const { eventId } = rounds[roundIndex];

  const numPrecedingRounds = rounds
    .slice(0, roundIndex)
    .filter((round) => round.eventId === eventId).length;

  return numPrecedingRounds + 1;
};

export const isFinalRound = (roundIndex: number, rounds: Array<Round>) => {
  const { eventId } = rounds[roundIndex];

  const roundNum = calcRoundNum(roundIndex, rounds);

  const numRoundsForEvent = rounds.filter(
    (round) => round.eventId === eventId
  ).length;

  return numRoundsForEvent === roundNum + 1;
};
