import {
  Paper,
  TableContainer,
  Button,
  Box,
  Typography,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { AddCircle, Close, ExpandMore } from "@mui/icons-material";
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
  defaultExpanded?: boolean;
};

export const Event = ({
  eventId,
  rounds,
  onAddRound,
  onRemoveRound,
  defaultExpanded,
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
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            pl: { sm: 2 },
          }}
        >
          <Typography variant="h6">{eventName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {rounds.length > 0 && (
            <TableContainer>
              <EventTable>{roundRows}</EventTable>
            </TableContainer>
          )}
          <Box
            sx={{ display: "flex", gap: "2em", pt: 2, justifyContent: "right" }}
          >
            <Button
              onClick={onAddRound}
              startIcon={
                <AddCircle
                  color={rounds.length < 4 ? "primary" : "disabled"}
                  fontSize="medium"
                />
              }
              disabled={rounds.length >= 4}
            >
              Add round
            </Button>
            <Button
              onClick={onRemoveRound}
              startIcon={
                <Close
                  color={rounds.length ? "error" : "disabled"}
                  fontSize="small"
                />
              }
              disabled={!rounds.length}
            >
              Remove round
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
