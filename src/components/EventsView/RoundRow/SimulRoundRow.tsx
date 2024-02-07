import { useState } from "react";
import { Round } from "../../../types";
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
  inverseSimulGroups,
}: RoundRowProps & {
  inverseSimulGroups: Array<Round & { roundNum: number; groupOffset: number }>;
}) => {
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
      {inverseSimulGroups.map((inverseSimulGroup) => {
        const simulGroup = inverseSimulGroup.simulGroups.find(
          ({ mainRound }) =>
            mainRound.eventId === round.eventId &&
            mainRound.roundNum === roundNum
        );

        if (!simulGroup) {
          return null;
        }

        return (
          <SimulGroupRow
            eventId={inverseSimulGroup.eventId}
            roundNum={inverseSimulGroup.roundNum - 1}
            simulGroup={{
              ...simulGroup,
              groupOffset: inverseSimulGroup.groupOffset,
            }}
            onUpdate={makeOnUpdateSimulRound(
              inverseSimulGroup.eventId,
              inverseSimulGroup.roundNum - 1,
              simulGroup.mainRound
            )}
            numStations={numStations}
            isInverseSimulGroup
          />
        );
      })}
      <RemainderGroupRow
        round={round}
        eventId={round.eventId}
        roundNum={roundNum}
        onUpdate={(field, value) => onUpdateRound(field, value, isEditingTime)}
        numStations={numStations}
        isEditingTime={isEditingTime}
        setEditingTime={() => setIsEditingTime(true)}
        inverseSimulGroups={inverseSimulGroups}
      />
    </>
  );
};
