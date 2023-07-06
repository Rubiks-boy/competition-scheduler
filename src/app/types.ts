import {
  Wcif,
  ManageableCompetition,
  EventId,
  Events,
  Schedule,
  OtherActivity,
  Stage,
} from "../types";

export type ShareableState = {
  selectedCompId: string | null;
  competitorLimit: string;
  isNumStationsTouched: boolean;
  numStations: string;
  startTime: Date;
  isShowingDefaultInfo: boolean;
  hasReorderedEvents: boolean;
  events: Events;
  schedule: Schedule;
  otherActivities: Record<OtherActivity, string>;
  venueName: string;
  stages: Array<Stage>;
};

export type State = ShareableState & {
  accessToken: string | null;
  manageableCompsPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  wcifPending: boolean;
  wcif: Wcif | null;
  fromImport: boolean;
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
      type: "VENUE_NAME_CHANGED";
      venueName: string;
    }
  | {
      type: "STAGE_CHECKED";
      stage: Stage;
      checked: boolean;
    }
  | {
      type: "IMPORT_APP_STATE";
      appState: ShareableState;
    };
