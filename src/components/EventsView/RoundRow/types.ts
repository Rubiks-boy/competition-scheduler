import type { EventId, Round } from "../../../types";

export type UpdatableRoundField =
  | "totalNumCompetitors"
  | "numGroups"
  | "scheduledTime";

export type UpdatableSimulField =
  | "scheduledTime"
  | "numMainCompetitors"
  | "numSecondaryCompetitors";

export type RoundRowProps = {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numStations: number;
  onUpdateRound: (
    field: UpdatableRoundField,
    value: string,
    isEditingTime: boolean
  ) => void;
  makeOnUpdateSimulRound: (
    eventId: EventId,
    roundNum: number,
    groupIndex: number
  ) => (field: UpdatableSimulField, value: string) => void;
  numCompetitorsInt: number;
  numRegistered: number;
};
