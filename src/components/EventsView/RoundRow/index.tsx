import { TableCell, TableRow } from "@mui/material";
import { EventId } from "@wca/helpers";
import { useSelector } from "../../../app/hooks";
import {
  getRoundSelector,
  groupIndicesForRoundSelector,
} from "../../../app/selectors";
import { AggregateRoundRow } from "./AggregateRoundRow";
import { GroupRow, SimulRoundRow } from "./SimulRoundRow";

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

  const mainRoundRow =
    round.type === "aggregate" ? (
      <AggregateRoundRow round={round} roundIndex={roundIndex} />
    ) : (
      <SimulRoundRow round={round} roundIndex={roundIndex} />
    );

  return (
    <>
      {groupIndices.map((entry, i) => {
        if (entry.correspondingMainEvent == null) {
          return (
            <>
              {mainRoundRow}
              {i < groupIndices.length - 1 && (
                <>
                  <TableRow>
                    <TableCell sx={{ borderBottom: 0, pb: 0 }}>
                      Part of later events
                    </TableCell>
                  </TableRow>
                </>
              )}
            </>
          );
        }

        const { eventId, roundIndex, groupIndex } =
          entry.correspondingMainEvent;

        const simulRound = getRound({
          eventId: eventId,
          roundNum: roundIndex,
        });
        if (!simulRound || simulRound?.type !== "groups") {
          return null;
        }
        const group = simulRound.groups[groupIndex];

        return (
          <>
            {i === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: 0, pb: 0 }}>
                  Part of earlier events
                </TableCell>
              </TableRow>
            )}
            <GroupRow
              group={group}
              eventId={eventId}
              roundIndex={roundIndex}
              groupIndex={groupIndex}
            />
          </>
        );
      })}
      <BottomBorder />
    </>
  );
};
