import type {
  Wcif,
  ManageableCompetition,
  EventId,
  Events,
  Schedule,
  OtherActivity,
  Stage,
  CustomStage,
  SecondaryEvent,
} from "../types";

// These properties existed prior to export functionality being initially implemented and can always be exported
export type AlwaysImportableAppState = {
  selectedCompId: string | null;
  isNumStationsTouched: boolean;
  numStations: string;
  isStationaryCompetition: boolean;
  isShowingDefaultInfo: boolean;
  hasReorderedEvents: boolean;
  events: Events;
  schedule: Schedule;
  otherActivities: Record<OtherActivity, string>;
  venueName: string;
  stages: Array<Stage>;
};

// These properties are included on new schedule exports
export type ShareableState = AlwaysImportableAppState & {
  speedSlider: number;
  startTimes: Array<Date>;
  competitorLimit: string | null;
  customStages: Array<CustomStage>;
  isUsingCustomStages: boolean;
  numberOfDays: string | null;
  numOtherActivities: Record<OtherActivity, string>;
};

// When importing a schedule from a sharable URL, we're guaranteed to have all
// AlwaysImportableAppState state and will have a subset of remaining ShareableState
export type ImportableAppState = AlwaysImportableAppState &
  Partial<ShareableState>;

export type State = ShareableState & {
  isOnHomePage: boolean;
  accessToken: string | null;
  manageableCompsPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  wcifPending: boolean;
  wcif: Wcif | null;
  importSource: "url" | "local_storage" | null;
  activeStep: number;
  isExported: boolean;
  isDebugging: boolean;
  experimentalFeaturesEnabled: boolean;
  showAdvanced: boolean;
};

export type Action =
  | {
      type: "SIGNIN_COMPLETE";
      accessToken: string;
    }
  | {
      type: "MANAGEABLE_COMPS_PENDING";
    }
  | {
      type: "MANAGEABLE_COMPS_SUCCESS";
      manageableComps: Array<ManageableCompetition>;
    }
  | {
      type: "MANAGEABLE_COMPS_ERROR";
    }
  | {
      type: "FETCH_WCIF_PENDING";
    }
  | {
      type: "FETCH_WCIF_SUCCESS";
      wcif: Wcif;
    }
  | {
      type: "FETCH_WCIF_ERROR";
    }
  | {
      type: "COMP_SELECTED";
      newId: string;
    }
  | {
      type: "COMPETITOR_LIMIT_CHANGED";
      competitorLimit: string;
    }
  | {
      type: "NUM_STATIONS_CHANGED";
      numStations: string;
    }
  | {
      type: "STATIONARY_COMPETITION_CHANGED";
      isStationaryCompetition: boolean;
    }
  | {
      type: "START_TIME_CHANGED";
      startTime: Date;
      dayIndex: number; // -1 => change all
    }
  | {
      type: "NUMBER_OF_DAYS_CHANGED";
      numberOfDays: string;
    }
  | {
      type: "ROUND_UPDATED";
      eventId: EventId;
      roundNum: number;
      isEditingTime: boolean;
      totalNumCompetitors?: string;
      numGroups?: string;
      scheduledTime?: string;
    }
  | {
      type: "ADD_GROUP";
      eventId: EventId;
      roundNum: number;
    }
  | {
      type: "REMOVE_GROUP";
      eventId: EventId;
      roundNum: number;
    }
  | {
      type: "REMOVE_ROUND";
      eventId: EventId;
    }
  | {
      type: "ADD_EVENTS";
      eventIds: Array<EventId>;
    }
  | {
      type: "REMOVE_EVENT";
      eventId: EventId;
    }
  | {
      type: "ADD_ROUND";
      eventId: EventId;
    }
  | {
      type: "REORDER_ROUND";
      oldIndex: number;
      newIndex: number;
    }
  | {
      type: "OTHER_ACTIVITY_TIME_SET";
      activity: OtherActivity;
      time: string;
    }
  | {
      type: "OTHER_ACTIVITY_ENABLED";
      activity: OtherActivity;
    }
  | {
      type: "OTHER_ACTIVITY_DISABLED";
      activity: OtherActivity;
    }
  | {
      type: "OTHER_ACTIVITY_NUMBER_CHANGED";
      activity: OtherActivity;
      numberOfActivity: string;
    }
  | {
      type: "VENUE_NAME_CHANGED";
      venueName: string;
    }
  | {
      type: "STAGE_CHECKED";
      stage: Stage;
      checked: boolean;
    }
  | {
      type: "USING_CUSTOM_STAGES_TOGGLED";
      isUsingCustomStages: boolean;
    }
  | {
      type: "CUSTOM_STAGE_CHANGED";
      index: number;
      customStage: CustomStage;
    }
  | {
      type: "ADD_CUSTOM_STAGE";
    }
  | {
      type: "REMOVE_CUSTOM_STAGE";
      index: number;
    }
  | {
      type: "IMPORT_APP_STATE";
      appState: ImportableAppState;
      source: "url" | "local_storage";
    }
  | {
      type: "SET_ACTIVE_STEP";
      activeStep: number;
    }
  | {
      type: "EXPORTED";
    }
  | {
      type: "RESET_ROUNDS";
    }
  | {
      type: "RESET_ESTIMATES_TO_WCIF";
    }
  | {
      type: "RESET_SCHEDULE";
    }
  | {
      type: "REIMPORT_SCHEDULE_FROM_WCIF";
    }
  | {
      type: "CREATE_SIMUL_GROUP";
      sourceIndex: number;
      destinationIndex: number;
    }
  | {
      type: "DUPLICATE_SIMUL_GROUP";
      mainEvent: {
        eventId: EventId;
        roundNum: number;
        groupIndex: number;
      };
      numCompetitors: string;
    }
  | {
      type: "UPDATE_SIMUL_GROUP";
      eventId: EventId;
      roundIndex: number;
      groupIndex: number;
      scheduledTime?: string;
      numMainCompetitors?: string;
      numSecondaryCompetitors?: string;
    }
  | {
      type: "REORDER_SIMUL_GROUP";
      startingLocation: {
        eventId: EventId;
        roundIndex: number;
        groupIndex: number;
      };
      endingLocation: {
        eventId: EventId;
        roundIndex: number;
        groupIndex: number;
      };
    }
  | {
      type: "DELETE_SIMUL_GROUP";
      eventId: EventId;
      roundIndex: number;
      groupIndex: number;
    }
  | {
      type: "SHOW_ADVANCED";
      showAdvanced: boolean;
    }
  | {
      type: "LEAVE_HOMEPAGE";
    }
  | {
      type: "SET_SPEED";
      value: number;
    };

export type Reducer = (state: State, action: Action) => State;
