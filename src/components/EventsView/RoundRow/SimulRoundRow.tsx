import { MainSimulRow } from "./MainSimulRow";
import { SimulGroupRow } from "./SimulGroupRow";
import type { RoundRowProps } from "./types";

export const SimulRoundRow = ({
  round,
  roundNum,
  isFinal,
  numRegistered,
}: RoundRowProps) => {
  return (
    <>
      <MainSimulRow
        round={round}
        roundNum={roundNum}
        isFinal={isFinal}
        numRegistered={numRegistered}
      />
      {round.simulGroups.map((simulGroup) => (
        <SimulGroupRow
          eventId={round.eventId}
          roundNum={roundNum}
          simulGroup={simulGroup}
          onUpdate={() => {}}
        />
      ))}
    </>
  );
};
