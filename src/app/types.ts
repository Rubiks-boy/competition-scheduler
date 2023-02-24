import {
  Wcif,
  ManageableCompetition,
  EventId,
  Events,
  Schedule,
} from "../types";

export type State = {
  accessToken: string | null;
  manageableCompsPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  wcifPending: boolean;
  wcif: Wcif | null;
  selectedCompId: string | null;
  numStations: number;
  startTime: Date;
  events: Events;
  schedule: Schedule;
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
      type: "NUM_STATIONS_CHANGED";
      numStations: number;
    }
  | {
      type: "START_TIME_CHANGED";
      startTime: Date;
    }
  | {
      type: "ROUND_UPDATED";
      eventId: EventId;
      roundNum: number;
      numCompetitors?: number;
      numGroups?: number;
      scheduledTime?: number;
    }
  | {
      type: "REMOVE_ROUND";
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
    };
