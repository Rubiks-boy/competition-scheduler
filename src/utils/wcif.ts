import type {
  AdvancementCondition,
  Cutoff,
  Room,
  RoundFormat,
  TimeLimit,
  Venue,
} from "@wca/helpers";
import {
  getColorForStage,
  ROUND_FORMAT,
  DEFAULT_CUTOFFS,
  DEFAULT_TIME_LIMITS,
} from "../constants";
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

export const getNumStationsFromWcif = (wcif: Wcif): number | null => {
  const venue = wcif.schedule?.venues?.[0];

  if (!venue) {
    return 0;
  }

  const { rooms } = venue;

  let sum = 0;
  rooms.forEach((room) => {
    const groupifierRoomConfig = room.extensions.find(
      ({ id }) => id === "groupifier.RoomConfig"
    );

    if (groupifierRoomConfig) {
      const data = groupifierRoomConfig.data as { stations: number };
      sum += data.stations;
    }
  });

  return sum;
};

export const getDefaultNumStations = (
  competitorLimit: number | null
): number => {
  if (!competitorLimit) {
    return 8;
  }

  if (competitorLimit >= 200) {
    return 24;
  }
  if (competitorLimit >= 150) {
    return 20;
  }
  if (competitorLimit >= 120) {
    return 16;
  }
  if (competitorLimit >= 80) {
    return 12;
  }

  return 8;
};

export const getDefaultEventsData = ({
  wcif,
  numStations,
  competitorLimit,
}: {
  wcif: Wcif;
  numStations: number;
  competitorLimit: number;
}): Events => {
  const { events: wcifEvents } = wcif;

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

const getDefaultTimeLimit = (
  eventId: EventId,
  roundNum: number
): TimeLimit | null => {
  const defaultTimeLimit = DEFAULT_TIME_LIMITS[eventId];

  if (roundNum === 1) {
    return defaultTimeLimit;
  }

  if (eventId === "333bf") {
    return defaultTimeLimit;
  }

  // For all events with a time limit in the first round,
  // set the time limit to 10 min in subsequent rounds
  return !!defaultTimeLimit
    ? { centiseconds: 60000, cumulativeRoundIds: [] }
    : null;
};

const getDefaultCutoff = (
  eventId: EventId,
  roundNum: number
): Cutoff | null => {
  if (roundNum > 1) {
    return null;
  }

  return DEFAULT_CUTOFFS[eventId];
};

const getDefaultWcifRound = (
  eventId: EventId,
  roundNum: number,
  format: RoundFormat
) => {
  return {
    id: `${eventId}-r${roundNum}`,
    format,
    timeLimit: getDefaultTimeLimit(eventId, roundNum),
    cutoff: getDefaultCutoff(eventId, roundNum),
    advancementCondition: null,
    results: [],
    extensions: [],
  };
};

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

      const originalRound = originalWcifEvent?.rounds.find(
        ({ id }) => id === `${eventId}-r${index + 1}`
      );

      return {
        ...getDefaultWcifRound(eventId, index + 1, ROUND_FORMAT[eventId]),
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
  startingId = 1,
  stationsPerRoom,
}: {
  scheduleWithTimes: Array<ScheduleEntryWithTime>;
  originalWcifRoom: WcifRoom;
  startingId: number;
  stationsPerRoom: number;
}) => {
  let nextId = startingId;

  const groupifierRoomConfig = {
    id: "groupifier.RoomConfig",
    specUrl:
      "https://groupifier.jonatanklosko.com/wcif-extensions/RoomConfig.json",
    data: { stations: stationsPerRoom },
  };

  const newExtensions = [
    ...originalWcifRoom.extensions.filter(
      ({ id }) => id !== "groupifier.RoomConfig"
    ),
    groupifierRoomConfig,
  ];

  return {
    ...originalWcifRoom,
    extensions: newExtensions,
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
  numStations,
}: {
  schedule: Schedule;
  startTime: Date;
  originalWcifSchedule: WcifSchedule;
  originalCompetition: ManageableCompetition;
  events: Events;
  otherActivities: Record<OtherActivity, string>;
  venueName: string;
  stages: Array<Stage>;
  numStations: number;
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
        rooms: venueRooms.map((originalWcifRoom, idx) =>
          createWcifRoom({
            scheduleWithTimes,
            originalWcifRoom,
            startingId: idx * 10000,
            stationsPerRoom: Math.floor(numStations / venueRooms.length),
          })
        ),
      },
    ],
  };
};
