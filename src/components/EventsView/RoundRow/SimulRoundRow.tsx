import type { Round } from "../../../types";
import { GroupRow } from "./GroupRow";
import { TotalRow } from "./TotalRow";

export const SimulRoundRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  return (
    <>
      <TotalRow round={round} roundIndex={roundIndex} />
      {round.groups.map((group, groupIndex) => (
        <GroupRow
          group={group}
          eventId={round.eventId}
          roundIndex={roundIndex}
          groupIndex={groupIndex}
        />
      ))}
    </>
  );
};
