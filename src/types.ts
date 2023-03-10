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
  // "magic",
  // "mmagic",
  // "333mbo",
  // "333ft",
];

export type ManageableCompetition = {
  id: string;
  name: string;
};

export type Events = {
  [E in EventId]: Array<Round> | null;
};

export type Round = {
  eventId: EventId;
  numCompetitors: string;
  numGroups: string;
  scheduledTime: string;
};

export type OtherActivity =
  | "registration"
  | "checkin"
  | "tutorial"
  | "lunch"
  | "awards";

export type ScheduleEntry =
  | { type: "event"; eventId: EventId; roundNum: number }
  | {
      type: "other";
      eventId: OtherActivity;
    };

export type ScheduleEntryWithTime = ScheduleEntry & {
  startTime: Date;
  endTime: Date;
  scheduledTimeMs: number;
};

export type Schedule = Array<ScheduleEntry>;

// Re-export the WCA types with Wcif prefix,
// to denote project-specific types from the WCA's types
export type {
  EventId,
  Round as WcifRound,
  Competition as Wcif,
  Event as WcifEvent,
  Schedule as WcifSchedule,
  Room as WcifRoom,
} from "@wca/helpers";
