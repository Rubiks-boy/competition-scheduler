import { NormalRoundRow } from "./NormalRoundRow";
import { RoundRowProps } from "./types";

export const RoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
  numCompetitorsInt,
  numRegistered,
}: RoundRowProps) => {
  if (round.type === "groups") {
    return null;
  }

  return (
    <NormalRoundRow
      round={round}
      roundNum={roundNum}
      isFinal={isFinal}
      numStations={numStations}
      onUpdateRound={onUpdateRound}
      numCompetitorsInt={numCompetitorsInt}
      numRegistered={numRegistered}
    />
  );
};
