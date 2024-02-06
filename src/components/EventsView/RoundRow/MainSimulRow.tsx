import { TableCell, TableRow, Typography } from "@mui/material";
import { getRoundName } from "./helpers";
import { Round } from "../../../types";
import { NumCompetitorsInput } from "./NumCompetitorsInput";

export const MainSimulRow = ({
  round,
  roundNum,
  isFinal,
  numRegistered,
  onUpdate,
}: {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numRegistered: number;
  onUpdate: (field: "totalNumCompetitors" | "numGroups", value: string) => void;
}) => {
  const { eventId, totalNumCompetitors } = round;

  const totalNumGroups = parseInt(round.numGroups) + round.simulGroups.length;
  const totalScheduledTime = round.simulGroups.reduce(
    (sum, { mainRound }) => sum + parseInt(mainRound.scheduledTime),
    parseInt(round.scheduledTime)
  );

  const regDiffPercent = Math.abs(
    (numRegistered - parseInt(totalNumCompetitors)) / numRegistered
  );

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell
        component="th"
        scope="row"
        sx={{ minWidth: "10em", borderBottom: "none" }}
      >
        {getRoundName(eventId, roundNum, isFinal)}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
        <NumCompetitorsInput
          numCompetitors={totalNumCompetitors}
          roundNum={roundNum}
          onChange={(value) => onUpdate("totalNumCompetitors", value)}
          numRegistered={numRegistered}
          regDiffPercent={regDiffPercent}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
        <Typography>{totalNumGroups}</Typography>
      </TableCell>
      <TableCell
        sx={{ minWidth: "6em", width: "10%", borderBottom: "none" }}
      ></TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: "none" }}>
        <Typography>{totalScheduledTime}</Typography>
      </TableCell>
    </TableRow>
  );
};
