import React from "react";
import { IconButton, TableCell, TableRow, TextField } from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import type { Round } from "../../types";
import { EVENT_NAMES } from "../../constants";
import {
  calcTimeForRound,
  calcRoundNum,
  compPerStationsRatio,
} from "../../utils/calculators";

export const RoundRow = ({
  roundIndex,
  rounds,
  numStations,
  onUpdateRound,
  onAddRound,
  onRemoveRound,
}: {
  roundIndex: number;
  rounds: Array<Round>;
  numStations: number;
  onUpdateRound: (
    field: "numCompetitors" | "numGroups" | "scheduledTime",
    value: string
  ) => void;
  onAddRound: () => void;
  onRemoveRound: () => void;
}) => {
  const round = rounds[roundIndex];
  const { eventId, numCompetitors, numGroups, scheduledTime } = round;

  const roundNum = calcRoundNum(roundIndex, rounds);
  const numRoundsForEvent = rounds.filter(
    (round) => round.eventId === eventId
  ).length;
  const isFinalRound = numRoundsForEvent === roundNum;

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row">
        {EVENT_NAMES[eventId]} {isFinalRound ? "final" : `Round ${roundNum}`}
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
      <TableCell align="right">
        <div className="events-tableIcons">
          <IconButton onClick={onAddRound}>
            <AddCircle color="primary" fontSize="medium" />
          </IconButton>
          <IconButton onClick={onRemoveRound}>
            <Close color="action" fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};
