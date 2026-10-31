import {
  Paper,
  TableContainer,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { AddCircle, Close, ExpandMore } from "@mui/icons-material";
import { DEFAULT_TIME_LIMITS, EVENT_NAMES } from "../../constants";
import { EventId } from "@wca/helpers";
import { Round } from "../../types";
import { useDispatch, useSelector } from "../../app/hooks";
import { dualRoundsSelector, wcifEventsSelector } from "../../app/selectors";
import { hasDualRounds } from "../../utils/dualRounds";
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
  const dispatch = useDispatch();
  const dualConfig = useSelector(dualRoundsSelector)[eventId];
  const dualEnabled = hasDualRounds(rounds, dualConfig?.enabled);
  const originalFirstRound = useSelector(wcifEventsSelector)
    .find((event) => event.id === eventId)
    ?.rounds.find((round) => round.id === `${eventId}-r1`);
  const timeLimit = originalFirstRound
    ? originalFirstRound.timeLimit
    : DEFAULT_TIME_LIMITS[eventId];
  const cumulativeTime = timeLimit?.cumulativeRoundIds.length
    ? timeLimit.centiseconds / 6000
    : null;
  const updateDualRounds = (
    enabled: boolean,
    sharedCumulativeTimeLimit: boolean
  ) => {
    dispatch({
      type: "DUAL_ROUNDS_UPDATED",
      eventId,
      enabled,
      sharedCumulativeTimeLimit,
    });
  };
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
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              pt: 2,
            }}
          >
            {rounds.length >= 2 && (
              <FormControlLabel
                control={
                  <Switch
                    checked={dualEnabled}
                    onChange={(_, checked) =>
                      updateDualRounds(
                        checked,
                        dualConfig?.sharedCumulativeTimeLimit ?? false
                      )
                    }
                  />
                }
                label="Dual rounds"
              />
            )}
            <Box sx={{ display: "flex", gap: "2em", ml: "auto" }}>
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
          </Box>
          {dualEnabled && cumulativeTime != null && (
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dualConfig?.sharedCumulativeTimeLimit ?? false}
                    onChange={(_, checked) => updateDualRounds(true, checked)}
                  />
                }
                label="Share cumulative time limit across both rounds"
              />
              <Typography variant="body2" color="text.secondary">
                {cumulativeTime} minutes{" "}
                {dualConfig?.sharedCumulativeTimeLimit
                  ? "across both rounds"
                  : "per round"}.
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
