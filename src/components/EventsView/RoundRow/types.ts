import type { EventId, Round } from "../../../types";

export type RoundRowProps = {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numStations: number;
  onUpdateRound: (
    field: "totalNumCompetitors" | "numGroups" | "scheduledTime",
    value: string,
    isEditingTime: boolean
  ) => void;
  makeOnUpdateSimulRound: (
    eventId: EventId,
    roundNum: number,
    mainRound: { eventId: EventId; roundNum: number }
  ) => (field: "numCompetitors" | "numGroups", value: string) => void;
  numCompetitorsInt: number;
  numRegistered: number;
};
