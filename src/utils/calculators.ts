import {
  HISTORICAL_PNW_REGISTRATION,
  IDEAL_COMPETITORS_PER_STATION,
  TIME_PER_GROUP,
} from "../constants";
import {
  EventId,
  Events,
  OtherActivity,
  Round,
  Schedule,
  ScheduleEntryWithTime,
} from "../types";

export const compPerStationsRatio = (round: Round, numStations: number) => {
  const numCompetitors = parseInt(round.numCompetitors || "0");
  const numGroups = parseInt(round.numGroups || "0");

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

export const getRoundNumStr = (
  eventId: EventId,
  roundNum: number,
  schedule: Schedule
) => {
  const isFinalRound =
    schedule.filter(
      (scheduleEntry) =>
        scheduleEntry.type === "event" && scheduleEntry.eventId === eventId
    ).length ===
    roundNum + 1;

  return isFinalRound ? "Final" : `Round ${roundNum + 1}`;
};

export const calcScheduleTimes = (
  startTime: Date,
  schedule: Schedule,
  events: Events,
  otherActivities: Record<OtherActivity, string>
): Array<ScheduleEntryWithTime> => {
  const roundsWithTimes: Array<ScheduleEntryWithTime> = [];

  let currStartMs = startTime.getTime();

  schedule.forEach((scheduleEntry) => {
    const scheduledTime =
      scheduleEntry.type === "event"
        ? events[scheduleEntry.eventId]?.[scheduleEntry.roundNum].scheduledTime
        : otherActivities[scheduleEntry.activity];
    const scheduledTimeMs = parseInt(scheduledTime || "0") * 60 * 1000;

    roundsWithTimes.push({
      ...scheduleEntry,
      startTime: new Date(currStartMs),
      endTime: new Date(currStartMs + scheduledTimeMs),
      scheduledTimeMs,
    });

    currStartMs += scheduledTimeMs;
  });

  return roundsWithTimes;
};
