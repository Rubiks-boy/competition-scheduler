import type { Round } from "../../../types";
import { GroupRow } from "./GroupRow";

export const SimulRoundRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  return (
    <>
      {round.groups.map((group, groupIndex) => (
        <GroupRow
          key={groupIndex}
          group={group}
          eventId={round.eventId}
          roundIndex={roundIndex}
          groupIndex={groupIndex}
        />
      ))}
    </>
  );
};
