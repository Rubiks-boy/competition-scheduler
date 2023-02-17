import { Round, WcifEvent } from "../types";
import { calcExpectedNumCompetitors } from "./calculators";

export const wcifEventsToRounds = (
  events: Array<WcifEvent>,
  competitorLimit: number
): Array<Round> => {
  const rounds = events.flatMap(({ id, rounds }) =>
    rounds.map((_, index) => ({
      eventId: id,
      roundNum: index,
      numCompetitors: null,
      numGroups: null,
      scheduledTime: null,
    }))
  );

  // For first rounds, calculated the expected number of competitors.
  // For subsequent rounds, use the advancement condition to attach the
  // number of competitors to the round
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
