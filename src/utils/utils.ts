import { LONG_EVENT_NAMES } from "../constants";
import { Events, EVENT_IDS, ScheduleEntry } from "../types";

export const pick = (obj: { [key: string]: any }, keys: Array<string>) =>
  keys.reduce((newObj, key) => ({ ...newObj, [key]: obj[key] }), {});

export const makeDefaultEvents = () =>
  EVENT_IDS.reduce(
    (events, eventId) => ({ ...events, [eventId]: null }),
    {} as Events
  );

export const constructActivityString = (scheduleEntry: ScheduleEntry) => {
  if (scheduleEntry.type === "event") {
    const { eventId, roundNum } = scheduleEntry;
    return `${LONG_EVENT_NAMES[eventId]}, Round ${roundNum + 1}`;
  }

  return (
    scheduleEntry.eventId.charAt(0).toUpperCase() +
    scheduleEntry.eventId.slice(1)
  );
};
