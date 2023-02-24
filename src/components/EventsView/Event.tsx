import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import { EVENT_NAMES } from "../../constants";
import { EventId } from "@wca/helpers";
import { Round } from "../../types";
import { RoundRow } from "./RoundRow";

type EventProps = {
  eventId: EventId;
  rounds: Array<Round>;
  numStations: number;
  makeOnUpdateRound: (
    eventId: EventId,
    roundIndex: number
  ) => (
    field: "numCompetitors" | "numGroups" | "scheduledTime",
    value: string
  ) => void;
  onAddRound: () => void;
  onRemoveRound: () => void;
};

export const Event = ({
  eventId,
  rounds,
  numStations,
  makeOnUpdateRound,
  onAddRound,
  onRemoveRound,
}: EventProps) => {
  const eventName = EVENT_NAMES[eventId];

  const roundRows = rounds.map((round, roundNum) => (
    <RoundRow
      key={`${round.eventId}-${roundNum}`}
      round={round}
      roundNum={roundNum}
      isFinal={roundNum === rounds.length - 1}
      numStations={numStations}
      onUpdateRound={makeOnUpdateRound(round.eventId, roundNum)}
    />
  ));

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">{eventName}</Typography>
        <div className="event-add-remove-btns">
          <IconButton onClick={onAddRound} disabled={rounds.length >= 4}>
            <AddCircle
              color={rounds.length < 4 ? "primary" : "disabled"}
              fontSize="medium"
            />
          </IconButton>
          <IconButton onClick={onRemoveRound} disabled={!rounds.length}>
            <Close
              color={rounds.length ? "error" : "disabled"}
              fontSize="small"
            />
          </IconButton>
        </div>
      </Toolbar>
      {rounds.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell align="right">Competitors</TableCell>
                <TableCell align="right">Groups</TableCell>
                <TableCell align="right">Ratio</TableCell>
                <TableCell align="right">Calc Time</TableCell>
                <TableCell align="right">Sch Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{roundRows}</TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
