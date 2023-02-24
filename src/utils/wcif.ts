import { ActivityCode, AdvancementCondition, RoundFormat } from "@wca/helpers";
import { ROUND_FORMAT } from "../constants";
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

const getDefaultWcifEvent = (eventId: EventId) => ({
  id: eventId,
  rounds: [],
  extensions: [],
});

const getDefaultWcifRound = (id: ActivityCode, format: RoundFormat) => ({
  id,
  format,
  timeLimit: null,
  cutoff: null,
  advancementCondition: null,
  results: [],
  extensions: [],
});

const createWcifEvent = (
  eventId: EventId,
  rounds: Array<Round>,
  originalWcifEvent: WcifEvent | undefined
): WcifEvent => {
  return {
    ...getDefaultWcifEvent(eventId),
    ...originalWcifEvent,
    rounds: rounds.map((round, index) => {
      const numAdvancingCompetitors = rounds[index + 1]?.numCompetitors ?? null;
      const advancementCondition: AdvancementCondition | null =
        numAdvancingCompetitors
          ? // TODO support other types of advancement conditions
            {
              type: "ranking",
              level: numAdvancingCompetitors,
            }
          : null;

      const roundId = `${eventId}-r${index + 1}`;

      const originalRound = originalWcifEvent?.rounds.find(
        ({ id }) => id === roundId
      );

      return {
        ...getDefaultWcifRound(roundId, ROUND_FORMAT[eventId]),
        ...originalRound,
        advancementCondition,
        ...(round.numGroups &&
          !originalRound?.scrambleSets && {
            scrambleSetCount: round.numGroups + 1,
          }),
      };
    }),
  };
};

export const createWcifEvents = (
  events: Events,
  originalWcifEvents: Array<WcifEvent>
): Array<WcifEvent> =>
  Object.entries(events)
    .filter(([_, rounds]) => rounds.length)
    .map(([eventId, rounds]) => {
      const originalWcifEvent = originalWcifEvents.find(
        ({ id }) => id === eventId
      );

      return createWcifEvent(eventId as EventId, rounds, originalWcifEvent);
    });

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
