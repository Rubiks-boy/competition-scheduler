import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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

  const roundRows = rounds.map(({ eventId }, roundIndex) => (
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
  ));

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
          {roundRows.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        component="div"
        count={rounds.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default EventsView;
