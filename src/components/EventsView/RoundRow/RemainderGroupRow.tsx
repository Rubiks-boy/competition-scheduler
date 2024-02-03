import { TableCell, TableRow, TextField, Typography } from "@mui/material";
import type { EventId, Round } from "../../../types";
import { compPerStationsRatio } from "../../../utils/calculators";
import { ScheduledTimeInput } from "./ScheduledTimeInput";

export const RemainderGroupRow = ({
  round,
  eventId,
  roundNum,
  onUpdate,
  numStations,
  isEditingTime,
  setEditingTime,
  inverseSimulGroups,
}: {
  round: Round;
  eventId: EventId;
  roundNum: number;
  onUpdate: (field: "numGroups" | "scheduledTime", value: string) => void;
  numStations: number;
  isEditingTime: boolean;
  setEditingTime: () => void;
  inverseSimulGroups: Array<Round & { roundNum: number }>;
}) => {
  const totalInverseSimulCompetitors = inverseSimulGroups
    .map((inverseSimulGroup) =>
      inverseSimulGroup.simulGroups.find(
        ({ mainRound }) =>
          mainRound.eventId === round.eventId && mainRound.roundNum === roundNum
      )
    )
    .reduce(
      (sum, group) => sum + parseInt(group?.mainRound.numCompetitors || "0"),
      0
    );
  const totalSimulCompetitors = round.simulGroups.reduce(
    (sum, { numCompetitors }) => sum + parseInt(numCompetitors),
    0
  );
  const remainingCompetitors =
    parseInt(round.totalNumCompetitors) -
    (totalSimulCompetitors + totalInverseSimulCompetitors);

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
        <ScheduledTimeInput
          isEditingTime={isEditingTime}
          setEditingTime={setEditingTime}
          round={round}
          onChange={(value) => onUpdate("scheduledTime", value)}
        />
      </TableCell>
    </TableRow>
  );
};
