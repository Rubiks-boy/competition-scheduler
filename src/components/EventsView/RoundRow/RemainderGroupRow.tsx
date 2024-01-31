import { TableCell, TableRow, TextField, Typography } from "@mui/material";
import type { EventId, Round } from "../../../types";
import { compPerStationsRatio } from "../../../utils/calculators";

export const RemainderGroupRow = ({
  round,
  eventId,
  roundNum,
  simulGroup,
  onUpdate,
  numStations,
}: {
  round: Round;
  eventId: EventId;
  roundNum: number;
  simulGroup: SimulGroup;
  onUpdate: (field: "numGroups", value: string) => void;
  numStations: number;
}) => {
  const totalSimulCompetitors = round.simulGroups.reduce(
    (sum, { numCompetitors }) => sum + parseInt(numCompetitors),
    0
  );
  const remainingCompetitors =
    parseInt(round.totalNumCompetitors) - totalSimulCompetitors;

  return (
    <TableRow key={`${eventId}-${roundNum}-remainder`}>
      <TableCell component="th" scope="row" sx={{ minWidth: "10em", pl: 4 }}>
        Non-simultaneous
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <Typography>{remainingCompetitors}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={round.numGroups}
          onChange={(e) => onUpdate("numGroups", e.target.value)}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%" }}>
        {compPerStationsRatio({
          numCompetitors: remainingCompetitors,
          numGroups: parseInt(round.numGroups || "0"),
          numStations,
        })}
      </TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
        <Typography>{simulGroup.mainRound.scheduledTime}</Typography>
      </TableCell>
    </TableRow>
  );
};
