import { TableCell, TableRow, TextField, Typography } from "@mui/material";
import { getRoundName } from "./helpers";
import type { EventId, SimulGroup } from "../../../types";

export const SimulGroupRow = ({
  eventId,
  roundNum,
  simulGroup,
  onUpdate,
}: {
  eventId: EventId;
  roundNum: number;
  simulGroup: SimulGroup;
  onUpdate: (field: "numCompetitors" | "numGroups", value: string) => void;
}) => {
  const simulEvent = simulGroup.mainRound.eventId;
  const simulRoundNum = simulGroup.mainRound.roundNum;

  return (
    <TableRow
      key={`${eventId}-${roundNum}-simul-${simulEvent}-${simulRoundNum}`}
    >
      <TableCell component="th" scope="row" sx={{ minWidth: "10em", pl: 4 }}>
        Alongside{" "}
        {getRoundName(
          simulEvent,
          simulRoundNum,
          // TODO: derive isFinal
          false
        )}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <TextField
          hiddenLabel
          size="small"
          value={simulGroup.numCompetitors}
          onChange={(e) => onUpdate("numCompetitors", e.target.value)}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={simulGroup.mainRound.numGroups}
          onChange={(e) => onUpdate("numGroups", e.target.value)}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%" }}></TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
        <Typography>{simulGroup.mainRound.scheduledTime}</Typography>
      </TableCell>
    </TableRow>
  );
};
