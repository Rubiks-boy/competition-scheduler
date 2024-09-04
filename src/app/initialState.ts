import { makeDefaultEvents } from "../utils/utils";
import type { State } from "./types";
import { STAGE_NAMES_AND_COLORS } from "../constants";

export const initialState: State = {
  isOnHomePage: true,
  accessToken: null,
  manageableCompsPending: false,
  manageableComps: [],
  selectedCompId: null,
  competitorLimit: null,
  isNumStationsTouched: false,
  numStations: "8",
  startTimes: [new Date(0)],
  wcifPending: false,
  wcif: null,
  isShowingDefaultInfo: true,
  hasReorderedEvents: false,
  events: makeDefaultEvents(),
  schedule: [],
  otherActivities: {
    registration: "30",
    checkin: "30",
    tutorial: "20",
    lunch: "60",
    awards: "15",
  },
  numOtherActivities: {
    registration: "1",
    checkin: "1",
    tutorial: "1",
    lunch: "1",
    awards: "1",
  },
  venueName: "",
  stages: ["Red", "Blue"],
  isUsingCustomStages: false,
  customStages: [{ stage: "Stage 1", color: STAGE_NAMES_AND_COLORS[1].color }],
  importSource: null,
  activeStep: 0,
  isExported: false,
  numberOfDays: null,
  isDebugging: localStorage.getItem("DEBUG") === "true",
  experimentalFeaturesEnabled:
    localStorage.getItem("ENABLE_EXPERIMENTAL") === "true",
  showAdvanced: false,
  speedSlider: 0,
};
