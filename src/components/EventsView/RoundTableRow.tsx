import React from "react";
import { IconButton, TableCell, TableRow, TextField } from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import { numStationsSelector, wcifEventsSelector } from "../../app/selectors";
import { Round } from "../../types";
import { EVENT_NAMES } from "../../constants";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../utils/calculators";

export const RoundTableRow = ({ round }: { round: Round }) => {
  const { eventId, roundNum, numCompetitors, numGroups, scheduledTime } = round;

  const dispatch = useDispatch();

  const numStations = useSelector(numStationsSelector);
  const wcifEvents = useSelector(wcifEventsSelector);

  const isFinalRound =
    wcifEvents.find(({ id }) => id === eventId)?.rounds.length === roundNum + 1;

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row">
        {EVENT_NAMES[eventId]}{" "}
        {isFinalRound ? "final" : `Round ${roundNum + 1}`}
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
              eventId,
              roundNum,
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
              eventId,
              roundNum,
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
              eventId,
              roundNum,
              scheduledTime,
            });
          }}
        />
      </TableCell>
      <TableCell align="right">
        <div className="events-tableIcons">
          <IconButton
          // onChange={() => {}}
          >
            <AddCircle color="primary" fontSize="medium" />
          </IconButton>
          <IconButton
          // onChange={() => {}}
          >
            <Close color="action" fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};
