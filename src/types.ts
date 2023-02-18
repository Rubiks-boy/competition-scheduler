const EVENTS = {
  "333": "333",
  "222": "222",
  "444": "444",
  "555": "555",
  "666": "666",
  "777": "777",
  "333bf": "333bf",
  "333fm": "333fm",
  "333oh": "333oh",
  clock: "clock",
  pyram: "pyram",
  minx: "minx",
  skewb: "skewb",
  sq1: "sq1",
  "444bf": "444bf",
  "555bf": "555bf",
  "333mbf": "333mbf",
};

export type EventId = keyof typeof EVENTS;

export const EVENT_IDS = Object.keys(EVENTS) as Array<EventId>;

export type WcifRound = {
  id: string;
  format: "1" | "2" | "3" | "a" | "m";
  advancementCondition: null | {
    type: "ranking" | "percent" | "attemptResult";
    level: number;
  };
};

export type WcifEvent = {
  id: EventId;
  rounds: Array<WcifRound>;
  qualification: null;
  extensions: [];
};

export type Wcif = {
  id: string;
  competitorLimit: number;
  events: Array<WcifEvent>;
};

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
