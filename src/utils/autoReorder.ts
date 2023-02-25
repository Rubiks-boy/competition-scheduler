import { IDEAL_EVENT_ORDERING } from "../constants";
import { OtherActivity, Schedule } from "../types";

const sortEventsInRound = (roundNum: number, schedule: Schedule): Schedule => {
  const eventsInRound = schedule.filter(
    (scheduleEntry) =>
      scheduleEntry.type === "event" && scheduleEntry.roundNum === roundNum
  );

  return IDEAL_EVENT_ORDERING.filter((eventId) =>
    eventsInRound.find((scheduleEntry) => scheduleEntry.eventId === eventId)
  ).map((eventId) => ({
    type: "event",
    eventId,
    roundNum,
  }));
};

export const autoReorder = (schedule: Schedule): Schedule => {
  const findActivity = (activity: OtherActivity) => {
    const scheduleEntry = schedule.find(
      (scheduleEntry) =>
        scheduleEntry.type === "other" && scheduleEntry.eventId === activity
    );

    return scheduleEntry ? [scheduleEntry] : [];
  };

  return [
    ...findActivity("registration"),
    ...findActivity("checkin"),
    ...findActivity("tutorial"),
    ...sortEventsInRound(0, schedule),
    ...findActivity("lunch"),
    ...[1, 2, 3].flatMap((i) => sortEventsInRound(i, schedule)),
    ...findActivity("awards"),
  ];
};
