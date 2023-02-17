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
import { useDispatch, useSelector } from "../../app/hooks";
import { numStationsSelector, roundsSelector } from "../../app/selectors";
import { RoundRow } from "./RoundRow";

import "./index.css";

const EventsView = () => {
  const dispatch = useDispatch();

  const rounds = useSelector(roundsSelector);
  const numStations = useSelector(numStationsSelector);

  const makeOnUpdateRound = (roundIndex: number) => {
    return (
      field: "numCompetitors" | "numGroups" | "scheduledTime",
      value: string
    ) => {
      dispatch({
        type: "ROUND_UPDATED",
        roundIndex,
        [field]: parseInt(value, 10),
      });
    };
  };

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
          {rounds.map(({ eventId }, roundIndex) => (
            <RoundRow
              key={roundIndex}
              rounds={rounds}
              roundIndex={roundIndex}
              numStations={numStations}
              onUpdateRound={makeOnUpdateRound(roundIndex)}
              onAddRound={() => {
                dispatch({
                  type: "ADD_ROUND",
                  eventId,
                  afterIndex: roundIndex,
                });
              }}
              onRemoveRound={() => {
                dispatch({
                  type: "REMOVE_ROUND",
                  roundIndex,
                });
              }}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventsView;
