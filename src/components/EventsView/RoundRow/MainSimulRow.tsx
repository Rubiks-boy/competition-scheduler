import { TableCell, TableRow, Typography } from "@mui/material";
import { getRoundName } from "./helpers";
import { Round } from "../../../types";

export const MainSimulRow = ({
  round,
  roundNum,
  isFinal,
  numRegistered,
}: {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numRegistered: number;
}) => {
  const { eventId } = round;

  const totalNumCompetitors = round.simulGroups.reduce(
    (sum, { numCompetitors }) => sum + parseInt(numCompetitors),
    parseInt(round.numCompetitors)
  );
  const totalNumGroups = round.simulGroups.reduce(
    (sum, { mainRound }) => sum + parseInt(mainRound.numGroups),
    parseInt(round.numGroups)
  );
  const totalScheduledTime = round.simulGroups.reduce(
    (sum, { mainRound }) => sum + parseInt(mainRound.scheduledTime),
    parseInt(round.scheduledTime)
  );

  const regDiffPercent = Math.abs(
    (numRegistered - totalNumCompetitors) / numRegistered
  );

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row" sx={{ minWidth: "10em" }}>
        {getRoundName(eventId, roundNum, isFinal)}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1em",
          }}
        >
          {totalNumCompetitors}
          {roundNum === 0 && numRegistered > 0 && (
            <RegDiffTooltip
              regDiffPercent={regDiffPercent}
              numRegistered={numRegistered}
            />
          )}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <Typography>{totalNumGroups}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%" }}></TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
        <Typography>{totalScheduledTime}</Typography>
      </TableCell>
    </TableRow>
  );
};
