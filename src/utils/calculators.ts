import {
  ACTIVITY_NAMES,
  EVENT_NAMES,
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
  ScheduleWithTimes,
  SimulGroup,
  WithTime,
} from "../types";
import { range } from "./utils";

export const compPerStationsRatio = ({
  numCompetitors,
  numGroups,
  numStations,
}: {
  numCompetitors: number;
  numGroups: number;
  numStations: number;
}) => {
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

export const getEventName = (eventId: EventId | OtherActivity) =>
  ({ ...EVENT_NAMES, ...ACTIVITY_NAMES }[eventId]);

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
  startTimes: Array<Date>,
  schedule: Schedule,
  events: Events,
  otherActivities: Record<OtherActivity, string>
): ScheduleWithTimes => {
  const roundsWithTimes: ScheduleWithTimes = [];

  let currStartMs = startTimes[0].getTime();

  schedule.forEach((scheduleEntry) => {
    if (scheduleEntry.type === "day-divider") {
      currStartMs = startTimes[scheduleEntry.dayIndex].getTime();

      roundsWithTimes.push({
        ...scheduleEntry,
        startTime: new Date(currStartMs),
        endTime: new Date(currStartMs),
        scheduledTimeMs: 0,
      });
      return;
    }

    let scheduledTimeMs: number;
    let nonSimulScheduledTimeMs: number = 0;
    if (scheduleEntry.type === "event") {
      const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];
      nonSimulScheduledTimeMs =
        parseInt(round?.scheduledTime || "0") * 60 * 1000;
      const simulScheduledTimeMs = (round?.simulGroups || []).reduce(
        (sum, simulGroup) =>
          sum + parseInt(simulGroup.mainRound.scheduledTime) * 60 * 1000,
        0
      );

      scheduledTimeMs = nonSimulScheduledTimeMs + simulScheduledTimeMs;
    } else {
      scheduledTimeMs =
        parseInt(otherActivities[scheduleEntry.eventId] || "0") * 60 * 1000;
    }

    roundsWithTimes.push({
      ...scheduleEntry,
      startTime: new Date(currStartMs),
      endTime: new Date(currStartMs + scheduledTimeMs),
      scheduledTimeMs,
      nonSimulScheduledTimeMs,
    });

    currStartMs += scheduledTimeMs;
  });

  return roundsWithTimes;
};

export const calcSimulGroupsWithTimes = (
  scheduleWithTimes: ScheduleWithTimes,
  events: Events
) => {
  const simulGroupsWithTimes: Array<WithTime<SimulGroup>> = [];

  scheduleWithTimes.forEach((scheduleEntry) => {
    if (scheduleEntry.type !== "event") {
      return;
    }

    const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];
    if (!round) {
      return;
    }

    const numGroups = parseInt(round.numGroups);
    let currStartTimeMs = scheduleEntry.startTime.getTime();
    const defaultTimePerGroupMs = Math.floor(
      scheduleEntry.nonSimulScheduledTimeMs / numGroups
    );

    range(numGroups).forEach((i) => {
      const simulGroup = round.simulGroups.find(
        ({ groupOffset }) => groupOffset === i
      );

      if (simulGroup) {
        const scheduledTimeMs =
          parseInt(simulGroup.mainRound.scheduledTime) * 1000 * 60;

        simulGroupsWithTimes.push({
          startTime: new Date(currStartTimeMs),
          endTime: new Date(currStartTimeMs + scheduledTimeMs),
          scheduledTimeMs,
          ...simulGroup,
        });

        currStartTimeMs += scheduledTimeMs;
      } else {
        currStartTimeMs += defaultTimePerGroupMs;
      }
    });
  });

  return simulGroupsWithTimes;
};
