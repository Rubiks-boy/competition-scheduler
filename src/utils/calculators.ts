import {
  ACTIVITY_NAMES,
  EVENT_NAMES,
  HISTORICAL_PNW_REGISTRATION,
  IDEAL_COMPETITORS_PER_STATION,
  DEFAULT_TIME_PER_GROUP,
  STATIONARY_TIME_PER_GROUP,
} from "../constants";
import {
  EventId,
  CompetitionStyle,
  DualRounds,
  Events,
  OtherActivity,
  Round,
  Schedule,
  ScheduleWithTimes,
  SimulGroup,
  WithTime,
} from "../types";
import { getRoundLabel } from "./dualRounds";
import { getScheduledTimeMs } from "./utils";

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
  numGroups: number | null,
  shouldRound: boolean = true,
  speedOffset: number,
  competitionStyle: CompetitionStyle = "standard"
) => {
  const groupTimes = competitionStyle === "stationary"
    ? STATIONARY_TIME_PER_GROUP : DEFAULT_TIME_PER_GROUP;
  const offset = (groupTimes[333] + speedOffset) / groupTimes[333];
  const timePerGroup = groupTimes[eventId] * offset;
  const calculatedTime = timePerGroup * (numGroups || 0);

  const roundingMinutes = competitionStyle === "stationary" ? 0.5 : 5;
  return shouldRound
    ? Math.ceil(calculatedTime / roundingMinutes) * roundingMinutes
    : calculatedTime;
};

export const calcExpectedNumCompetitors = (
  eventId: EventId,
  competitorLimit: number
) => Math.floor(competitorLimit * HISTORICAL_PNW_REGISTRATION[eventId]);

export const calcNumGroups = ({
  eventId,
  numCompetitors,
  numStations,
  competitionStyle = "standard",
}: {
  eventId: EventId;
  numCompetitors: number;
  numStations: number;
  competitionStyle?: CompetitionStyle;
}) => {
  if (competitionStyle === "stationary") {
    return numStations > 0 ? Math.ceil(numCompetitors / (numStations + 1)) : 0;
  }
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
  schedule: Schedule,
  dualRounds: DualRounds = {},
  events?: Events
) => getRoundLabel(
  eventId,
  roundNum,
  events?.[eventId]?.length ?? new Set(schedule.flatMap(entry =>
    entry.type === "event" && entry.eventId === eventId ? [entry.roundNum] : []
  )).size,
  dualRounds
);

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
    if (scheduleEntry.type === "event") {
      const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];
      scheduledTimeMs = round ? getScheduledTimeMs(round) : 0;
    } else {
      scheduledTimeMs =
        parseInt(otherActivities[scheduleEntry.eventId] || "0") * 60 * 1000;
    }

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

export const calcSimulGroupsWithTimes = (
  eventId: EventId,
  roundIndex: number,
  scheduleWithTimes: ScheduleWithTimes,
  events: Events
) => {
  const simulGroupsWithTimes: Array<WithTime<SimulGroup>> = [];

  scheduleWithTimes.forEach((scheduleEntry) => {
    if (scheduleEntry.type !== "event") {
      return;
    }

    const round = events[scheduleEntry.eventId]?.[scheduleEntry.roundNum];
    if (!round || round.type !== "groups") {
      return;
    }

    let currStartTimeMs = scheduleEntry.startTime.getTime();
    round.groups.forEach((g) => {
      const scheduledTimeMs = parseFloat(g.scheduledTime) * 1000 * 60;
      if (
        g.secondaryEvent &&
        g.secondaryEvent.eventId === eventId &&
        g.secondaryEvent.roundIndex === roundIndex
      ) {
        simulGroupsWithTimes.push({
          ...g,
          startTime: new Date(currStartTimeMs),
          endTime: new Date(currStartTimeMs + scheduledTimeMs),
          scheduledTimeMs,
        });
      }
      currStartTimeMs += scheduledTimeMs;
    });
  });

  return simulGroupsWithTimes;
};
