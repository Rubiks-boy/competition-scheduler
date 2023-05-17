import type {
  ActivityCode,
  AdvancementCondition,
  Room,
  RoundFormat,
  Venue,
} from "@wca/helpers";
import { getColorForStage, ROUND_FORMAT } from "../constants";
import {
  EventId,
  Events,
  EVENT_IDS,
  ManageableCompetition,
  OtherActivity,
  Round,
  Schedule,
  ScheduleEntryWithTime,
  Stage,
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
      const roundNum = parseInt(id[id.indexOf("-r") + 2], 10);

      const numCompetitors =
        roundNum === 1
          ? calcExpectedNumCompetitors(eventId, competitorLimit)
          : getAdvancementLevelForRound(wcifRounds, roundNum - 1);

      const numGroups = calcNumGroups({ eventId, numCompetitors, numStations });

      const scheduledTime = calcTimeForRound(eventId, numGroups);

      return {
        eventId,
        numCompetitors: numCompetitors.toString(),
        numGroups: numGroups.toString(),
        scheduledTime: scheduledTime.toString(),
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
    (events[eventId] || []).map((_, roundNum) => ({
      type: "event",
      eventId,
      roundNum,
    }))
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
      const numAdvancingCompetitors = parseInt(
        rounds[index + 1]?.numCompetitors || "0"
      );
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
            scrambleSetCount: parseInt(round.numGroups || "0") + 1,
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
    .filter(([_, rounds]) => rounds?.length)
    .map(([eventId, rounds]) => {
      const originalWcifEvent = originalWcifEvents.find(
        ({ id }) => id === eventId
      );

      return createWcifEvent(
        eventId as EventId,
        rounds ?? [],
        originalWcifEvent
      );
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
    activities: scheduleWithTimes.map((scheduleEntry) => {
      const { type, startTime, endTime } = scheduleEntry;

      const activityCode =
        type === "event"
          ? `${scheduleEntry.eventId}-r${scheduleEntry.roundNum + 1}`
          : `other-${scheduleEntry.eventId}`;

      const originalActivity = originalWcifRoom.activities.find(
        (activity) => activity.activityCode === activityCode
      );

      return {
        ...(originalActivity
          ? originalActivity
          : {
              name: constructActivityString(scheduleEntry),
              activityCode,
              childActivities: [],
              scrambleSetId: null,
              extensions: [],
            }),
        id: nextId++,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
    }),
  };
};

export const createWcifSchedule = ({
  schedule,
  startTime,
  originalWcifSchedule,
  originalCompetition,
  events,
  otherActivities,
  venueName,
  stages,
}: {
  schedule: Schedule;
  startTime: Date;
  originalWcifSchedule: WcifSchedule;
  originalCompetition: ManageableCompetition;
  events: Events;
  otherActivities: Record<OtherActivity, string>;
  venueName: string;
  stages: Array<Stage>;
}) => {
  if (originalWcifSchedule.venues.length > 1) {
    // TODO: better erroring
    return originalWcifSchedule;
  }

  const originalVenue = originalWcifSchedule.venues[0];

  const newVenue: Venue = {
    id: 1,
    name: venueName,
    latitudeMicrodegrees: originalCompetition.latitude_degrees * 10 ** 6,
    longitudeMicrodegrees: originalCompetition.longitude_degrees * 10 ** 6,
    countryIso2: originalCompetition.country_iso2,
    // TODO don't autofill LA for everyone :(
    // There's probably some smart library someone made to convert lat/long -> timezone?
    timezone: "America/Los_Angeles",
    // Leave rooms blank here. We'll merge in rooms below.
    rooms: [],
    extensions: [],
  };

  const baseVenueInfo =
    originalWcifSchedule.venues.length > 0 ? originalVenue : newVenue;

  const newRooms: Array<Room> = stages.map((stage, id) => ({
    id,
    name: `${stage} Stage`,
    color: getColorForStage(stage),
    activities: [],
    extensions: [],
  }));

  const venueRooms =
    baseVenueInfo.rooms.length > 0 ? baseVenueInfo.rooms : newRooms;

  const scheduleWithTimes = calcScheduleTimes(
    startTime,
    schedule,
    events,
    otherActivities
  );

  return {
    ...originalWcifSchedule,
    // Situations for venues / rooms:
    // 1. No venue and no rooms currently on website -> Use our new venue/stage info.
    // 2. Both venue and rooms already on website -> Keep the existing info
    // 3. A venue with no rooms on the website -> Keep existing venue, but add rooms (stages) to that venue.
    // Using baseVenueInfo + venueRooms makes sure it uses information already on the site or adds in the new info if needed.
    venues: [
      {
        ...baseVenueInfo,
        rooms: venueRooms.map((originalWcifRoom) =>
          createWcifRoom({ scheduleWithTimes, originalWcifRoom })
        ),
      },
    ],
  };
};
