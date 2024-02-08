import { Box, TableCell, TableRow } from "@mui/material";
import type { Round } from "../../../types";
import { useSelector } from "../../../app/hooks";
import {
  getNumGroupsSelector,
  getRoundNameSelector,
  getScheduledTimeSelector,
  totalNumCompetitorsSelector,
} from "../../../app/selectors";
import { RegDiffTooltip } from "./tooltips";

export const TotalRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  const { eventId } = round;
  const roundName = useSelector(getRoundNameSelector)({ eventId, roundIndex });
  const numCompetitors = useSelector(totalNumCompetitorsSelector)({
    eventId,
    roundIndex,
  });
  const numGroups = useSelector(getNumGroupsSelector)({ eventId, roundIndex });
  const scheduledTime = useSelector(getScheduledTimeSelector)({
    eventId,
    roundIndex,
  });

  return (
    <TableRow key={`${eventId}-${roundIndex}`}>
      <TableCell
        component="th"
        scope="row"
        sx={{
          minWidth: "10em",
          borderBottom: 0,
        }}
      >
        {roundName}
      </TableCell>
      <TableCell
        sx={{
          minWidth: "8em",
          width: "20%",
          borderBottom: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: "0.5em" }}>
          {numCompetitors}
          <RegDiffTooltip regDiffPercent={20} numRegistered={25} />
        </Box>
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: 0 }}>
        {numGroups}
      </TableCell>
      <TableCell
        sx={{ minWidth: "6em", width: "10%", borderBottom: 0 }}
      ></TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: 0 }}>
        {scheduledTime}
      </TableCell>
    </TableRow>
  );
};
