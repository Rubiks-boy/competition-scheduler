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
  latitude_degrees: number;
  longitude_degrees: number;
  country_iso2: string;
};

export type Events = {
  [E in EventId]: { rounds: Array<Round>; numRegistered: number } | null;
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
  | "lunch"
  | "tutorial"
  | "awards";

export type ScheduleEntry =
  | { type: "event"; eventId: EventId; roundNum: number }
  | {
      type: "other";
      eventId: OtherActivity;
      index: number;
    };

export type DayDivider = {
  type: "day-divider";
  dayIndex: number;
};

export type WithTime<T> = T & {
  startTime: Date;
  endTime: Date;
  scheduledTimeMs: number;
};

export type Schedule = Array<ScheduleEntry | DayDivider>;
export type ScheduleWithTimes = Array<WithTime<ScheduleEntry | DayDivider>>;

// Re-export the WCA types with Wcif prefix,
// to denote project-specific types from the WCA's types
export type {
  EventId,
  Round as WcifRound,
  Competition as Wcif,
  Event as WcifEvent,
  Schedule as WcifSchedule,
  Room as WcifRoom,
  Person as WcifPerson,
} from "@wca/helpers";

export type Stage = "Red" | "Blue" | "Green " | "Orange" | "Purple";

export type CustomStage = {
  stage: string;
  color: string; // hex values
};

export type RoundExtension = {
  id: "competitionScheduler.RoundConfig";
  specUrl: "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md";
  data: {
    expectedRegistrations?: number | null | undefined;
    groupCount?: number | null | undefined;
  };
};
