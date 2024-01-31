import { useState } from "react";
import { calcTimeForRound } from "../../../utils/calculators";
import { MainSimulRow } from "./MainSimulRow";
import { RemainderGroupRow } from "./RemainderGroupRow";
import { SimulGroupRow } from "./SimulGroupRow";
import type { RoundRowProps } from "./types";

export const SimulRoundRow = ({
  round,
  roundNum,
  isFinal,
  numRegistered,
  onUpdateRound,
  makeOnUpdateSimulRound,
  numStations,
}: RoundRowProps) => {
  const calculatedTime = calcTimeForRound(
    round.eventId,
    parseInt(round.numGroups || "0")
  );
  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(round.scheduledTime)
  );

  return (
    <>
      <MainSimulRow
        round={round}
        roundNum={roundNum}
        isFinal={isFinal}
        numRegistered={numRegistered}
        onUpdate={(field, value) => onUpdateRound(field, value, isEditingTime)}
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
          numStations={numStations}
        />
      ))}
      <RemainderGroupRow
        round={round}
        eventId={round.eventId}
        roundNum={roundNum}
        onUpdate={(field, value) => onUpdateRound(field, value, isEditingTime)}
        numStations={numStations}
        isEditingTime={isEditingTime}
        setEditingTime={() => setIsEditingTime(true)}
      />
    </>
  );
};
