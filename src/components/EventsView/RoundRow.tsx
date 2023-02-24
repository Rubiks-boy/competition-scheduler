import React from "react";
import { TableCell, TableRow, TextField } from "@mui/material";
import type { Round } from "../../types";
import { EVENT_NAMES } from "../../constants";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../utils/calculators";

export const RoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
}: {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numStations: number;
  onUpdateRound: (
    field: "numCompetitors" | "numGroups" | "scheduledTime",
    value: string
  ) => void;
}) => {
  const { eventId, numCompetitors, numGroups, scheduledTime } = round;

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row">
        {EVENT_NAMES[eventId]} {isFinal ? "Final" : `Round ${roundNum + 1}`}
      </TableCell>
      <TableCell align="right">
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={numCompetitors ?? ""}
          onChange={(e) => onUpdateRound("numCompetitors", e.target.value)}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={numGroups ?? ""}
          onChange={(e) => onUpdateRound("numGroups", e.target.value)}
        />
      </TableCell>
      <TableCell align="right">
        {compPerStationsRatio(round, numStations)}
      </TableCell>
      <TableCell align="right">
        {calcTimeForRound(eventId, numGroups)}
      </TableCell>
      <TableCell align="right">
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={scheduledTime ?? ""}
          onChange={(e) => onUpdateRound("scheduledTime", e.target.value)}
        />
      </TableCell>
    </TableRow>
  );
};
