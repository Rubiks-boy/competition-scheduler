import type { Round } from "../../../types";

export type RoundRowProps = {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numStations: number;
  onUpdateRound: (
    field: "numCompetitors" | "numGroups" | "scheduledTime",
    value: string,
    isEditingTime: boolean
  ) => void;
  numCompetitorsInt: number;
  numRegistered: number;
};
