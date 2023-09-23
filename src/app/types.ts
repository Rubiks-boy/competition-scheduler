import {
  Wcif,
  ManageableCompetition,
  EventId,
  Events,
  Schedule,
  OtherActivity,
  Stage,
  CustomStage,
} from "../types";

// These properties existed prior to export functionality being initially implemented and can always be exported
export type AlwaysImportableAppState = {
  selectedCompId: string | null;
  isNumStationsTouched: boolean;
  numStations: string;
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
  accessToken: string | null;
  manageableCompsPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  wcifPending: boolean;
  wcif: Wcif | null;
  importSource: "url" | "local_storage" | null;
  activeStep: number;
  isExported: boolean;
  isDebugging: boolean;
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
      numCompetitors?: string;
      numGroups?: string;
      scheduledTime?: string;
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
    };
