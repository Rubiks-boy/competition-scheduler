export type EventId =
  | "333"
  | "222"
  | "444"
  | "555"
  | "666"
  | "777"
  | "333bf"
  | "333fm"
  | "333oh"
  | "clock"
  | "pyram"
  | "minx"
  | "skewb"
  | "sq1"
  | "444bf"
  | "555bf"
  | "333mbf";

type WcifRound = {
  id: string;
  advancementCondition: null | {
    type: "ranking" | "percent" | "attemptResult";
    level: number;
  };
};

export type WcifEvent = {
  id: EventId;
  rounds: Array<WcifRound>;
};

export type Wcif = {
  competitorLimit: number;
  events: Array<WcifEvent>;
};

export type ManageableCompetition = {
  id: string;
  name: string;
};

export type Round = {
  eventId: EventId;
  roundNum: number;
  numCompetitors: number | null;
  numGroups: number | null;
  scheduledTime: number | null;
};
