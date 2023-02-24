import { LONG_EVENT_NAMES } from "../constants";
import { EventId, Events, EVENT_IDS } from "../types";

export const pick = (obj: { [key: string]: any }, keys: Array<string>) =>
  keys.reduce((newObj, key) => ({ ...newObj, [key]: obj[key] }), {});

export const makeDefaultEvents = () =>
  EVENT_IDS.reduce(
    (events, eventId) => ({ ...events, [eventId]: [] }),
    {} as Events
  );

export const constructActivityString = (eventId: EventId, roundNum: number) =>
  `${LONG_EVENT_NAMES[eventId]}, Round ${roundNum + 1}`;
