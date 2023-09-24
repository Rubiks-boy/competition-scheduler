import { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
} from "@mui/material";
import { AddCircle, ExpandMore } from "@mui/icons-material";
import { EventId } from "@wca/helpers";
import { EVENT_NAMES } from "../../constants";
import { Box } from "@mui/system";

export const AddEvent = ({
  eventIdOptions,
  addEvents,
}: {
  eventIdOptions: Array<EventId>;
  addEvents: (eventsToAdd: Array<EventId>) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eventsToAdd, setEventsToAdd] = useState<Array<EventId>>([]);

  const addEvent = (event: EventId) => {
    setEventsToAdd((oldEvents) => [...oldEvents, event]);
  };

  const onSave = () => {
    setIsExpanded(false);
    addEvents(eventsToAdd);
  };

  const eventRows = eventIdOptions.map((eventId) => {
    const isAlreadyAdded = eventsToAdd.includes(eventId);
    return (
      <TableRow key={eventId}>
        <TableCell>{EVENT_NAMES[eventId]}</TableCell>
        <TableCell align="right">
          <IconButton
            onClick={() => addEvent(eventId)}
            disabled={isAlreadyAdded}
          >
            <AddCircle color={isAlreadyAdded ? "disabled" : "primary"} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Accordion
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Add event</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableBody>{eventRows}</TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ pt: 2, pb: 2, float: "right" }}>
            <Button disabled={!eventsToAdd.length} onClick={onSave}>
              Save
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
