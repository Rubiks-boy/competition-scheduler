import { TableCell, TableRow } from "@mui/material";
import { EventId } from "@wca/helpers";
import { useSelector } from "../../../app/hooks";
import {
  getRoundSelector,
  groupIndicesForRoundSelector,
} from "../../../app/selectors";
import { AggregateRoundRow } from "./AggregateRoundRow";
import { GroupRow } from "./GroupRow";
import { SimulRoundRow } from "./SimulRoundRow";

const BottomBorder = () => (
  <TableRow>
    <TableCell sx={{ p: 0 }}></TableCell>
    <TableCell sx={{ p: 0 }}></TableCell>
    <TableCell sx={{ p: 0 }}></TableCell>
    <TableCell sx={{ p: 0 }}></TableCell>
    <TableCell sx={{ p: 0 }}></TableCell>
  </TableRow>
);

export const RoundRow = ({
  eventId,
  roundIndex,
}: {
  eventId: EventId;
  roundIndex: number;
}) => {
  const getRound = useSelector(getRoundSelector);
  const groupIndices = useSelector((state) =>
    groupIndicesForRoundSelector(state, { eventId, roundIndex })
  );
  const round = getRound({ eventId, roundNum: roundIndex });

  if (!round) {
    return null;
  }

  return (
    <>
      {round.type === "aggregate" && (
        <AggregateRoundRow round={round} roundIndex={roundIndex} />
      )}
      {round.type === "aggregate" && groupIndices.length > 1 && (
        <TableRow>
          <TableCell sx={{ borderBottom: 0, pb: 0 }}>
            Simul with other rounds
          </TableCell>
        </TableRow>
      )}
      {groupIndices.map((entry) => {
        if (entry.correspondingMainEvent == null) {
          return (
            round.type === "groups" && (
              <SimulRoundRow round={round} roundIndex={roundIndex} />
            )
          );
        }

        const {
          eventId,
          roundIndex: roundNum,
          groupIndex,
        } = entry.correspondingMainEvent;

        const simulRound = getRound({
          eventId: eventId,
          roundNum,
        });
        if (!simulRound || simulRound?.type !== "groups") {
          return null;
        }
        const group = simulRound.groups[groupIndex];

        return (
          <GroupRow
            group={group}
            eventId={eventId}
            roundIndex={roundNum}
            groupIndex={groupIndex}
          />
        );
      })}
      <BottomBorder />
    </>
  );
};
