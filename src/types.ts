import { 
  EventId, 
  RoundFormat as WcaRoundFormat,
  TimeLimit as WcaTimeLimit,
  Cutoff as WcaCutoff,
  AdvancementCondition as WcaAdvancementCondition,
  Result as WcaResult,
  ScrambleSet as WcaScrambleSet
} from "@wca/helpers";

// Extend WCA RoundFormat to include "5" for Best of 5 (WCIF v1.1)
export type RoundFormat = WcaRoundFormat | "5";

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
  [E in EventId]: Array<Round> | null;
};

export type SecondaryEvent = {
  eventId: EventId;
  roundIndex: number;
  numCompetitors: string;
};

export type SimulGroup = {
  secondaryEvent?: SecondaryEvent;
  numMainCompetitors: string;
  scheduledTime: string;
};

export type Round =
  | {
      type: "aggregate";
      eventId: EventId;
      totalNumCompetitors: string;
      numGroups: string;
      scheduledTime: string;
    }
  | {
      type: "groups";
      eventId: EventId;
      groups: Array<SimulGroup>;
    };

export type OtherActivity =
  | "registration"
  | "checkin"
  | "lunch"
  | "tutorial"
  | "awards"
  | "doorsOpen"
  | "doorsClose";

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
  Schedule as WcifSchedule,
  Room as WcifRoom,
  Person as WcifPerson,
} from "@wca/helpers";

// Extension interface (not exported from @wca/helpers)
interface Extension {
  id: string;
  specUrl: string;
  data: object;
}

// ActivityCode type (not exported from @wca/helpers, but used in Round)
type ActivityCode = string;

// Extended Round type that supports the new "5" format (Best of 5)
export interface WcifRound {
  id: ActivityCode;
  format: RoundFormat;
  timeLimit: WcaTimeLimit | null;
  cutoff: WcaCutoff | null;
  advancementCondition: WcaAdvancementCondition | null;
  results: WcaResult[];
  scrambleSetCount?: number;
  scrambleSets?: WcaScrambleSet[];
  extensions: Extension[];
}

// Extended Event type that uses our extended WcifRound
export interface WcifEvent {
  id: EventId;
  rounds: WcifRound[];
  competitorLimit?: number | null;
  qualification?: import("@wca/helpers").Qualification | null;
  extensions: Extension[];
}

// Extended Competition (Wcif) type that uses our extended WcifEvent
export interface Wcif {
  formatVersion: string;
  id: string;
  name: string;
  shortName: string;
  persons: import("@wca/helpers").Person[];
  events: WcifEvent[];
  schedule: import("@wca/helpers").Schedule;
  series: import("@wca/helpers").Series[];
  competitorLimit: number | null;
  extensions: Extension[];
  registrationInfo: import("@wca/helpers").RegistrationInfo;
}

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

export type GroupExtension = {
  id: "competitionScheduler.GroupConfig";
  specUrl: "https://github.com/Rubiks-boy/competition-scheduler/blob/main/ExtensionsSpec.md";
  data: {
    numCompetitors?: number | null | undefined;
  };
};
