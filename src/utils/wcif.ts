import { EventId, Round, Wcif, WcifEvent, WcifRound } from "../types";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "./calculators";

type RoundWithRoundNum = Round & { roundNum: number };

const wcifEventsToRounds = (
  events: Array<WcifEvent>
): Array<RoundWithRoundNum> => {
  return events.flatMap(({ id, rounds }) =>
    rounds.map(({ format }, index) => ({
      eventId: id,
      format,
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
  rounds: Array<RoundWithRoundNum>,
  events: Array<WcifEvent>,
  competitorLimit: number
): Array<RoundWithRoundNum> => {
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
  rounds: Array<RoundWithRoundNum>,
  numStations: number
): Array<RoundWithRoundNum> => {
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

const addScheduledTime = (
  rounds: Array<RoundWithRoundNum>
): Array<RoundWithRoundNum> => {
  return rounds.map((round) => {
    const { eventId, numGroups } = round;

    if (!numGroups) {
      return round;
    }

    return {
      ...round,
      scheduledTime: calcTimeForRound(eventId, numGroups),
    };
  });
};

export const getDefaultRoundData = ({
  wcif,
  numStations,
}: {
  wcif: Wcif;
  numStations: number;
}): Array<Round> => {
  const { events, competitorLimit } = wcif;
  const rounds = wcifEventsToRounds(events);
  const withNumCompetitors = addNumCompetitors(
    rounds,
    events,
    competitorLimit || 0
  );
  const withNumGroups = addNumGroups(withNumCompetitors, numStations);
  const withScheduledTimed = addScheduledTime(withNumGroups);

  return withScheduledTimed;
};

const getEventIds = (rounds: Array<Round>): Array<EventId> => {
  return [...new Set(rounds.map(({ eventId }) => eventId))];
};

const getAdvanceConditionType = (
  wcifEvents: Array<WcifEvent>,
  eventId: string,
  roundNum: number
) => {
  // const event = wcifEvents.find(({ id }) => id == eventId);

  // return (
  //   event?.rounds.find(({ id }) => id === `${eventId}-${roundNum}`)
  //     ?.advancementCondition?.type ?? "ranking"
  // );

  // TODO: support other types
  return "ranking" as const;
};

export const roundsToWcifEvents = (
  rounds: Array<Round>,
  originalWcifEvents: Array<WcifEvent>
): Array<WcifEvent> => {
  const eventIds = getEventIds(rounds);

  return eventIds.map((id: EventId) => {
    const roundsInEvent = rounds.filter(({ eventId }) => eventId === id);

    const wcifRounds: Array<WcifRound> = roundsInEvent.map((round, index) => {
      const numAdvancingCompetitors =
        roundsInEvent[index + 1]?.numCompetitors ?? null;

      const advancementCondition = numAdvancingCompetitors
        ? // TODO support other types of advancement conditions
          {
            type: getAdvanceConditionType(originalWcifEvents, id, index + 1),
            level: numAdvancingCompetitors,
          }
        : null;

      const roundId = `${round.eventId}-r${index + 1}`;

      return {
        id: roundId,
        format: round.format,
        advancementCondition,
        scrambleSetCount: (round.numGroups ?? 0) + 1,
        // TODO properly set up time limits, cutoffs, other round info.
        // grab from the previous info we have for the event?
        // maybe for subsequent events make the time limit 10m and cutoff null?
        timeLimit: { centiseconds: 60000, cumulativeRoundIds: [] },
        cutoff: null,
        results: [],
        extensions: [],
      };
    });

    return {
      id,
      rounds: wcifRounds,
      qualification: null,
      extensions: [],
    };
  });
};

// export const roundsToWcifSchedule = ({
//   rounds,
//   startTime,
//   numberOfDays,
//   originalWcifVenues,
// }: {
//   rounds: Array<Round>;
//   startTime: Date;
//   numberOfDays: number;
//   originalWcifVenues: Array<WcifVenue>;
// }) => {
//   const venues = originalWcifVenues.map((originalVenue) => {
//     return originalVenue;
//   });

//   return {
//     startDate: startTime.toISOString().split("T")[0], // YYYY-MM-DD
//     numberOfDays,
//     venues,
//   };
// };
