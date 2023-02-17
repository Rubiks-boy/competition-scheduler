export type ManageableCompetition = {
  id: string;
  name: string;
};

export type State = {
  accessToken: string | null;
  manageableCompsPending: boolean;
  manageableComps: Array<ManageableCompetition>;
  selectedCompId: string | null;
  numStations: number;
  startTime: Date;
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
    };
