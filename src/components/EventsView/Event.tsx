import {
  Paper,
  TableContainer,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import { EVENT_NAMES } from "../../constants";
import { EventId } from "@wca/helpers";
import { Round } from "../../types";
import { EventTable } from "./EventTable";
import { RoundRow } from "./RoundRow";

type EventProps = {
  eventId: EventId;
  rounds: Array<Round>;
  onAddRound: () => void;
  onRemoveRound: () => void;
};

export const Event = ({
  eventId,
  rounds,
  onAddRound,
  onRemoveRound,
}: EventProps) => {
  const eventName = EVENT_NAMES[eventId];
  const roundRows = rounds.map((round, roundIndex) => (
    <RoundRow
      key={`${round.eventId}-${roundIndex}`}
      eventId={round.eventId}
      roundIndex={roundIndex}
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
            <Tooltip title="Add round">
              <AddCircle
                color={rounds.length < 4 ? "primary" : "disabled"}
                fontSize="medium"
              />
            </Tooltip>
          </IconButton>
          <IconButton onClick={onRemoveRound} disabled={!rounds.length}>
            <Tooltip title="Remove round">
              <Close
                color={rounds.length ? "error" : "disabled"}
                fontSize="small"
              />
            </Tooltip>
          </IconButton>
        </div>
      </Toolbar>
      {rounds.length > 0 && (
        <TableContainer>
          <EventTable>{roundRows}</EventTable>
        </TableContainer>
      )}
    </Paper>
  );
};
