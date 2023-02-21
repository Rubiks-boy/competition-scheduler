import { EventId } from "@wca/helpers";

export const EVENT_IDS: Array<EventId> = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333fm",
  "333oh",
  "clock",
  "pyram",
  "minx",
  "skewb",
  "sq1",
  "444bf",
  "555bf",
  "333mbf",
  // Deprecated events
  "magic",
  "mmagic",
  "333mbo",
  "333ft",
];

export type ManageableCompetition = {
  id: string;
  name: string;
};

export type Round = {
  eventId: EventId;
  format: "1" | "2" | "3" | "a" | "m";
  numCompetitors: number | null;
  numGroups: number | null;
  scheduledTime: number | null;
};

// Re-export the WCA types with Wcif prefix,
// to denote project-specific types from the WCA's types
export type {
  EventId,
  Round as WcifRound,
  Competition as Wcif,
  Event as WcifEvent,
} from "@wca/helpers";
