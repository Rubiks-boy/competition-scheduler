import React from "react";
import { IconButton, TableCell, TableRow, TextField } from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import { numStationsSelector, roundsSelector } from "../../app/selectors";
import { Round } from "../../types";
import { EVENT_NAMES } from "../../constants";
import {
  calcTimeForRound,
  calcRoundNum,
  compPerStationsRatio,
} from "../../utils/calculators";

export const RoundTableRow = ({
  round,
  roundIndex,
}: {
  round: Round;
  roundIndex: number;
}) => {
  const { eventId, numCompetitors, numGroups, scheduledTime } = round;

  const dispatch = useDispatch();

  const numStations = useSelector(numStationsSelector);
  const rounds = useSelector(roundsSelector);

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
          onChange={(e) => {
            const numCompetitors = parseInt(e.target.value, 10);
            dispatch({
              type: "ROUND_UPDATED",
              roundIndex,
              numCompetitors,
            });
          }}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={numGroups ?? ""}
          onChange={(e) => {
            const numGroups = parseInt(e.target.value, 10);
            dispatch({
              type: "ROUND_UPDATED",
              roundIndex,
              numGroups,
            });
          }}
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
          onChange={(e) => {
            const scheduledTime = parseInt(e.target.value, 10);
            dispatch({
              type: "ROUND_UPDATED",
              roundIndex,
              scheduledTime,
            });
          }}
        />
      </TableCell>
      <TableCell align="right">
        <div className="events-tableIcons">
          <IconButton
            onClick={() => {
              dispatch({
                type: "ADD_ROUND",
                eventId,
                afterIndex: roundIndex,
              });
            }}
          >
            <AddCircle color="primary" fontSize="medium" />
          </IconButton>
          <IconButton
            onClick={() => {
              dispatch({
                type: "REMOVE_ROUND",
                roundIndex,
              });
            }}
          >
            <Close color="action" fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};
