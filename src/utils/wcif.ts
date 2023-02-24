import { ActivityCode, AdvancementCondition, RoundFormat } from "@wca/helpers";
import { ROUND_FORMAT } from "../constants";
import {
  EventId,
  Events,
  EVENT_IDS,
  Round,
  Schedule,
  ScheduleEntryWithTime,
  Wcif,
  WcifEvent,
  WcifRoom,
  WcifRound,
  WcifSchedule,
} from "../types";
import {
  calcExpectedNumCompetitors,
  calcNumGroups,
  calcScheduleTimes,
  calcTimeForRound,
} from "./calculators";
import { constructActivityString, makeDefaultEvents } from "./utils";

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

const createWcifRoom = ({
  scheduleWithTimes,
  originalWcifRoom,
}: {
  scheduleWithTimes: Array<ScheduleEntryWithTime>;
  originalWcifRoom: WcifRoom;
}) => {
  let nextId = 1;

  return {
    ...originalWcifRoom,
    activities: scheduleWithTimes.map(
      ({ eventId, roundNum, startTime, endTime }) => {
        const activityCode = `${eventId}-r${roundNum + 1}`;

        const originalActivity = originalWcifRoom.activities.find(
          (activity) => activity.activityCode === activityCode
        );

        return {
          ...(originalActivity
            ? originalActivity
            : {
                id: nextId++,
                name: constructActivityString(eventId, roundNum),
                activityCode,
                childActivities: [],
                scrambleSetId: null,
                extensions: [],
              }),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };
      }
    ),
  };
};

export const createWcifSchedule = ({
  schedule,
  startTime,
  originalWcifSchedule,
  events,
}: {
  schedule: Schedule;
  startTime: Date;
  originalWcifSchedule: WcifSchedule;
  events: Events;
}) => {
  if (originalWcifSchedule.venues.length !== 1) {
    // TODO: better erroring
    return originalWcifSchedule;
  }

  const originalVenue = originalWcifSchedule.venues[0];

  const scheduleWithTimes = calcScheduleTimes(startTime, schedule, events);

  return {
    ...originalWcifSchedule,
    venues: [
      {
        ...originalVenue,
        rooms: originalVenue.rooms.map((originalWcifRoom) =>
          createWcifRoom({ scheduleWithTimes, originalWcifRoom })
        ),
      },
    ],
  };
};
