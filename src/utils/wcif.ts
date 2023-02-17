import { Round, Wcif, WcifEvent } from "../types";
import { calcExpectedNumCompetitors, calcNumGroups } from "./calculators";

const wcifEventsToRounds = (events: Array<WcifEvent>): Array<Round> => {
  return events.flatMap(({ id, rounds }) =>
    rounds.map((_, index) => ({
      eventId: id,
      roundNum: index,
      numCompetitors: null,
      numGroups: null,
      scheduledTime: null,
    }))
  );
};

// For first rounds, calculated the expected number of competitors.
// For subsequent rounds, use the advancement condition to attach the
// number of competitors to the round
const addNumCompetitors = (
  rounds: Array<Round>,
  events: Array<WcifEvent>,
  competitorLimit: number
): Array<Round> => {
  return rounds.map((round) => {
    const { eventId, roundNum } = round;

    if (roundNum === 0) {
      return {
        ...round,
        numCompetitors: calcExpectedNumCompetitors(eventId, competitorLimit),
      };
    }

    const event = events.find(({ id }) => id === eventId);
    const prevRound = event?.rounds[roundNum - 1];

    const advancementCondition = prevRound?.advancementCondition;

    return advancementCondition?.type === "ranking"
      ? { ...round, numCompetitors: advancementCondition.level }
      : round;
  });
};

const addNumGroups = (
  rounds: Array<Round>,
  numStations: number
): Array<Round> => {
  return rounds.map((round) => {
    const { eventId, numCompetitors } = round;

    if (!numCompetitors) {
      return round;
    }

    return {
      ...round,
      numGroups: calcNumGroups({ eventId, numCompetitors, numStations }),
    };
  });
};

export const getDefaultRoundData = ({
  wcif,
  numStations,
}: {
  wcif: Wcif;
  numStations: number;
}) => {
  const { events, competitorLimit } = wcif;
  const rounds = wcifEventsToRounds(events);
  const withNumCompetitors = addNumCompetitors(rounds, events, competitorLimit);
  const withNumGroups = addNumGroups(withNumCompetitors, numStations);

  return withNumGroups;
};
