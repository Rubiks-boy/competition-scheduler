import { EventId } from "@wca/helpers";
import { useSelector } from "../../../app/hooks";
import {
  getSimulGroupsForEventSelector,
  getRoundSelector,
} from "../../../app/selectors";
import { AggregateRoundRow } from "./AggregateRoundRow";
import { GroupRow, SimulRoundRow } from "./SimulRoundRow";

export const RoundRow = ({
  eventId,
  roundIndex,
}: {
  eventId: EventId;
  roundIndex: number;
}) => {
  const getRound = useSelector(getRoundSelector);
  const round = getRound({ eventId, roundNum: roundIndex });

  const simulGroups = useSelector(getSimulGroupsForEventSelector)({
    eventId,
    roundIndex,
  });

  if (!round) {
    return null;
  }

  return (
    <>
      {round.type === "aggregate" ? (
        <AggregateRoundRow round={round} roundIndex={roundIndex} />
      ) : (
        <SimulRoundRow round={round} roundIndex={roundIndex} />
      )}
      {simulGroups.map((simulGroup) => {
        const simulRound = getRound({
          eventId: simulGroup.eventId,
          roundNum: simulGroup.roundIndex,
        });
        if (!simulRound || simulRound?.type !== "groups") {
          return null;
        }
        const group = simulRound.groups[simulGroup.groupIndex];
        return group && <GroupRow group={group} {...simulGroup} />;
      })}
    </>
  );
};
