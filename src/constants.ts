import { RoundFormat } from "@wca/helpers";
import type { EventId, Stage } from "./types";
import { colors } from "@mui/material";

export const EVENT_NAMES = {
  "333": "3x3",
  "222": "2x2",
  "444": "4x4",
  "555": "5x5",
  "666": "6x6",
  "777": "7x7",
  "333bf": "3x3 Blindfolded",
  "333fm": "Fewest Moves",
  "333oh": "3x3 OH",
  clock: "Clock",
  pyram: "Pyraminx",
  minx: "Megaminx",
  skewb: "Skewb",
  sq1: "Square-1",
  "444bf": "4x4 Blindfolded",
  "555bf": "5x5 Blindfolded",
  "333mbf": "Multi-Blind",
  // Deprecated events
  magic: "magic",
  mmagic: "mmagic",
  "333mbo": "333mbo",
  "333ft": "333ft",
};

export const LONG_EVENT_NAMES = {
  "333": "3x3x3 Cube",
  "222": "2x2x2 Cube",
  "444": "4x4x4 Cube",
  "555": "5x5x5 Cube",
  "666": "6x6x6 Cube",
  "777": "7x7x7 Cube",
  "333bf": "3x3x3 Blindfolded",
  "333fm": "3x3x3 Fewest Moves",
  "333oh": "3x3x3 One-Handed",
  clock: "Clock",
  pyram: "Pyraminx",
  minx: "Megaminx",
  skewb: "Skewb",
  sq1: "Square-1",
  "444bf": "4x4x4 Blindfolded",
  "555bf": "5x5x5 Blindfolded",
  "333mbf": "3x3x3 Multi-Blind",
  // Deprecated events
  magic: "magic",
  mmagic: "mmagic",
  "333mbo": "333mbo",
  "333ft": "333ft",
};

export const TIME_PER_GROUP = {
  "333": 18.5,
  "222": 18,
  "444": 25,
  "555": 27.5,
  "666": 26,
  "777": 27.5,
  "333bf": 22.5,
  "333fm": 0,
  "333oh": 20,
  clock: 20,
  pyram: 18,
  minx: 27.5,
  skewb: 18,
  sq1: 18.5,
  "444bf": 0,
  "555bf": 0,
  "333mbf": 0,
  // Deprecated events
  magic: 0,
  mmagic: 0,
  "333mbo": 0,
  "333ft": 0,
};

export const HISTORICAL_PNW_REGISTRATION = {
  "333": 0.972,
  "222": 0.817,
  "444": 0.579,
  "555": 0.397,
  "666": 0.264,
  "777": 0.224,
  "333bf": 0.235,
  "333fm": 0.238,
  "333oh": 0.503,
  clock: 0.252,
  pyram: 0.68,
  minx: 0.341,
  skewb: 0.519,
  sq1: 0.359,
  "444bf": 0.106,
  "555bf": 0.089,
  "333mbf": 0.141,
  // Deprecated events
  magic: 0,
  mmagic: 0,
  "333mbo": 0,
  "333ft": 0,
};

export const IDEAL_COMPETITORS_PER_STATION = {
  "333": 1.8,
  "222": 2.0,
  "444": 1.7,
  "555": 1.5,
  "666": 1.5,
  "777": 1.5,
  "333bf": 1.6,
  "333fm": 9999,
  "333oh": 1.8,
  clock: 1.5,
  pyram: 1.9,
  minx: 1.5,
  skewb: 1.9,
  sq1: 1.5,
  "444bf": 9999,
  "555bf": 9999,
  "333mbf": 9999,
  // Deprecated events
  magic: 0,
  mmagic: 0,
  "333mbo": 0,
  "333ft": 0,
};

export const ROUND_FORMAT: Record<EventId, RoundFormat> = {
  "333": "a",
  "222": "a",
  "444": "a",
  "555": "a",
  "666": "m",
  "777": "m",
  "333bf": "3",
  "333fm": "1",
  "333oh": "a",
  clock: "a",
  pyram: "a",
  minx: "a",
  skewb: "a",
  sq1: "a",
  "444bf": "3",
  "555bf": "3",
  "333mbf": "1",
  // Deprecated events
  magic: "a",
  mmagic: "a",
  "333mbo": "a",
  "333ft": "a",
};

export const OTHER_ACTIVITES = [
  "registration",
  "checkin",
  "tutorial",
  "lunch",
  "awards",
];

export const EVENT_COLORS = [
  colors.deepPurple,
  colors.indigo,
  colors.teal,
  colors.deepOrange,
  colors.pink,
  colors.purple,
  colors.green,
  colors.red,
  colors.orange,
  colors.blue,
  colors.lightGreen,
  // colors.cyan,
  // colors.blueGrey,
  // colors.amber,
  // colors.lightBlue,
  // colors.lime,
  // colors.yellow,
  // colors.brown,
  // colors.grey,
];

export const IDEAL_EVENT_ORDERING: Array<EventId> = [
  "333",
  "444",
  "222",
  "777",
  "666",
  "minx",
  "555",
  "333oh",
  "sq1",
  "pyram",
  "skewb",
  "clock",
  "333bf",
  "333fm",
  "444bf",
  "555bf",
  "333mbf",
];

export const ACTIVITIES = [
  "registration",
  "checkin",
  "tutorial",
  "lunch",
  "awards",
] as const;

export const ACTIVITY_NAMES = {
  registration: "Registration",
  checkin: "Check-in",
  tutorial: "Tutorial",
  lunch: "Lunch",
  awards: "Awards",
};

export const STAGE_NAMES_AND_COLORS = [
  {
    stage: "Red",
    color: "#963030",
  },
  {
    stage: "Blue",
    color: "#304a96",
  },
  {
    stage: "Green",
    color: "#309644",
  },
  {
    stage: "Orange",
    color: "#e09635",
  },
  {
    stage: "Purple",
    color: "#800080",
  },
] as Array<{ stage: Stage; color: string }>;

export const getColorForStage = (stage: Stage) => {
  return (
    STAGE_NAMES_AND_COLORS.find((s) => s.stage === stage)?.color || "#304a96"
  );
};

export const DEFAULT_CUTOFFS = {
  "333": null,
  "222": null,
  "444": { attemptResult: 9000, numberOfAttempts: 2 },
  "555": { attemptResult: 15000, numberOfAttempts: 2 },
  "666": { attemptResult: 25500, numberOfAttempts: 1 },
  "777": { attemptResult: 36000, numberOfAttempts: 1 },
  "333bf": null,
  "333fm": null,
  "333oh": { attemptResult: 4500, numberOfAttempts: 2 },
  clock: { attemptResult: 3000, numberOfAttempts: 2 },
  pyram: null,
  minx: { attemptResult: 15000, numberOfAttempts: 2 },
  skewb: null,
  sq1: { attemptResult: 4000, numberOfAttempts: 2 },
  "444bf": null,
  "555bf": null,
  "333mbf": null,
  // Deprecated events
  magic: null,
  mmagic: null,
  "333mbo": null,
  "333ft": null,
};

export const DEFAULT_TIME_LIMITS = {
  "333": { centiseconds: 60000, cumulativeRoundIds: [] },
  "222": { centiseconds: 9000, cumulativeRoundIds: [] },
  "444": { centiseconds: 24000, cumulativeRoundIds: [] },
  "555": { centiseconds: 39000, cumulativeRoundIds: [] },
  "666": { centiseconds: 60000, cumulativeRoundIds: [] },
  "777": { centiseconds: 60000, cumulativeRoundIds: [] },
  "333bf": { centiseconds: 60000, cumulativeRoundIds: ["333bf-r1"] },
  "333fm": null,
  "333oh": { centiseconds: 12000, cumulativeRoundIds: [] },
  clock: { centiseconds: 9000, cumulativeRoundIds: [] },
  pyram: { centiseconds: 9000, cumulativeRoundIds: [] },
  minx: { centiseconds: 39000, cumulativeRoundIds: [] },
  skewb: { centiseconds: 9000, cumulativeRoundIds: [] },
  sq1: { centiseconds: 10000, cumulativeRoundIds: [] },
  "444bf": null,
  "555bf": null,
  "333mbf": null,
  // Deprecated events
  magic: null,
  mmagic: null,
  "333mbo": null,
  "333ft": null,
};
