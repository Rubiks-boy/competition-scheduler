import { LONG_EVENT_NAMES } from "../constants";
import { Events, EVENT_IDS, ScheduleEntry } from "../types";

export const pick = (obj: { [key: string]: any }, keys: Array<string>) =>
  keys.reduce((newObj, key) => ({ ...newObj, [key]: obj[key] }), {});

export const makeDefaultEvents = () =>
  EVENT_IDS.reduce(
    (events, eventId) => ({ ...events, [eventId]: [] }),
    {} as Events
  );

export const constructActivityString = (scheduleEntry: ScheduleEntry) => {
  if (scheduleEntry.type === "event") {
    const { eventId, roundNum } = scheduleEntry;
    return `${LONG_EVENT_NAMES[eventId]}, Round ${roundNum + 1}`;
  }

  return (
    scheduleEntry.activity.charAt(0).toUpperCase() +
    scheduleEntry.activity.slice(1)
  );
};
