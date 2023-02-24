import {
  EventId,
  Events,
  EVENT_IDS,
  Round,
  Schedule,
  Wcif,
  WcifEvent,
  WcifRound,
} from "../types";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcTimeForRound,
} from "./calculators";
import { makeDefaultEvents } from "./utils";

const getAdvancementLevelForRound = (
  wcifRounds: Array<WcifRound>,
  roundNum: number
) => {
  // ex. if roundNum is 2, will find the event with 'eventId-r2'
  const round = wcifRounds.find(({ id }) => id.includes(`-r${roundNum}`));

  // TODO: other types currently not supported
  if (round?.advancementCondition?.type !== "ranking") {
    return 0;
  }

  return round?.advancementCondition?.level;
};

const wcifRoundsToEventRounds = (
  wcifRounds: Array<WcifRound>,
  eventId: EventId,
  competitorLimit: number,
  numStations: number
): Array<Round> => {
  return wcifRounds
    .map(({ id }) => {
      // ex. '333-r2' -> 2
      const roundNum = parseInt(id[id.indexOf("r") + 1], 10);

      const numCompetitors =
        roundNum === 1
          ? calcExpectedNumCompetitors(eventId, competitorLimit)
          : getAdvancementLevelForRound(wcifRounds, roundNum - 1);

      const numGroups = calcNumGroups({ eventId, numCompetitors, numStations });

      const scheduledTime = calcTimeForRound(eventId, numGroups);

      return {
        eventId,
        numCompetitors,
        numGroups,
        scheduledTime,
        roundNum,
      };
    })
    .sort((a, b) => a.roundNum - b.roundNum);
};

export const getDefaultEventsData = ({
  wcif,
  numStations,
}: {
  wcif: Wcif;
  numStations: number;
}): Events => {
  const { events: wcifEvents, competitorLimit } = wcif;

  const events = makeDefaultEvents();

  wcifEvents.forEach(({ id, rounds }) => {
    events[id] = wcifRoundsToEventRounds(
      rounds,
      id,
      competitorLimit || 0,
      numStations
    );
  });

  return events;
};

export const getDefaultSchedule = (events: Events): Schedule => {
  return EVENT_IDS.flatMap((eventId) =>
    events[eventId].map((_, roundNum) => ({ eventId, roundNum }))
  );
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
        format: "a",
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
