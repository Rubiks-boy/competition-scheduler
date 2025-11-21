import { IDEAL_EVENT_ORDERING } from "../constants";
import { OtherActivity, Schedule } from "../types";
import { range } from "./utils";

const sortEventsInRound = (roundNum: number, schedule: Schedule): Schedule => {
  const eventsInRound = schedule.filter(
    (scheduleEntry) =>
      scheduleEntry.type === "event" && scheduleEntry.roundNum === roundNum
  );

  return IDEAL_EVENT_ORDERING.filter((eventId) =>
    eventsInRound.find(
      (scheduleEntry) =>
        scheduleEntry.type !== "day-divider" &&
        scheduleEntry.eventId === eventId
    )
  ).map((eventId) => ({
    type: "event",
    eventId,
    roundNum,
  }));
};

export const autoReorder = (schedule: Schedule): Schedule => {
  const findActivity = (activity: OtherActivity, index?: number) => {
    const scheduleEntry = schedule.find((scheduleEntry) => {
      if (scheduleEntry.type !== "other") {
        return false;
      }

      if (
        scheduleEntry.eventId === "lunch" &&
        activity === "lunch" &&
        !!index
      ) {
        return scheduleEntry.index === index;
      }

      return scheduleEntry.eventId === activity;
    });

    return scheduleEntry ? [scheduleEntry] : [];
  };

  const reorderedSchedule: Schedule = [
    ...findActivity("doorsOpen"),
    ...findActivity("registration"),
    ...findActivity("checkin"),
    ...findActivity("tutorial"),
    ...sortEventsInRound(0, schedule),
    ...[1, 2, 3].flatMap((i) => sortEventsInRound(i, schedule)),
    ...findActivity("awards"),
    ...findActivity("doorsClose"),
  ];

  const numActivities = reorderedSchedule.length;
  const numberOfDays = schedule.filter(
    ({ type }) => type === "day-divider"
  ).length;

  // Split up the day dividers evenly among the event IDs, and put lunch in the middle of each
  // ex. if it's a 3 day comp, 1/3 of the activities will be on day 1, 1/3 on day 3, etc.
  // and lunch will be halfway through each
  // _ideally_ this would use how long the events are projected to take, but... ehhhh
  const activitiesPerDay = Math.floor(numActivities / numberOfDays);
  const dividerLocations = range(numberOfDays).map(
    (dayIndex) => activitiesPerDay * dayIndex
  );
  dividerLocations.reverse();
  dividerLocations.forEach((dividerLoc, i) => {
    const dayIndex = numberOfDays - (i + 1);
    reorderedSchedule.splice(
      dividerLoc + Math.floor(activitiesPerDay / 2),
      0,
      ...findActivity("lunch", dayIndex)
    );
    reorderedSchedule.splice(dividerLoc, 0, {
      type: "day-divider",
      dayIndex,
    });
  });

  return reorderedSchedule;
};
