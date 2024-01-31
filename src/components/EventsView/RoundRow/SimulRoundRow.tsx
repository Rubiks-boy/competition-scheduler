import { MainSimulRow } from "./MainSimulRow";
import { SimulGroupRow } from "./SimulGroupRow";
import type { RoundRowProps } from "./types";

export const SimulRoundRow = ({
  round,
  roundNum,
  isFinal,
  numRegistered,
  onUpdateRound,
  makeOnUpdateSimulRound,
}: RoundRowProps) => {
  return (
    <>
      <MainSimulRow
        round={round}
        roundNum={roundNum}
        isFinal={isFinal}
        numRegistered={numRegistered}
        // TODO: Pipe in isEditing
        onUpdate={(field, value) => onUpdateRound(field, value, true)}
      />
      {round.simulGroups.map((simulGroup) => (
        <SimulGroupRow
          eventId={round.eventId}
          roundNum={roundNum}
          simulGroup={simulGroup}
          onUpdate={makeOnUpdateSimulRound(
            round.eventId,
            roundNum,
            simulGroup.mainRound
          )}
        />
      ))}
    </>
  );
};
