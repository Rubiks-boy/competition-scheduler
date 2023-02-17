import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useSelector } from "../../app/hooks";
import { roundsSelector } from "../../app/selectors";
import { RoundTableRow } from "./RoundTableRow";

import "./index.css";

const EventsView = () => {
  const rounds = useSelector(roundsSelector);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell align="right">Competitors</TableCell>
            <TableCell align="right">Groups</TableCell>
            <TableCell align="right">Ratio</TableCell>
            <TableCell align="right">Calc Time</TableCell>
            <TableCell align="right">Sch Time</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rounds.map((round) => (
            <RoundTableRow
              key={`${round.eventId}-${round.roundNum}`}
              round={round}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventsView;
