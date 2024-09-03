import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import { AddCircle, Clear, ExpandMore } from "@mui/icons-material";
import { EventId } from "@wca/helpers";
import { EVENT_NAMES } from "../constants";
import { useSelector, useDispatch } from "../app/hooks";
import { eventsSelector } from "../app/selectors";
import { EVENT_IDS } from "../types";
import { OtherActivities } from "./EventsView/OtherActivites";

const AddEvents = () => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(true);
  const events = useSelector(eventsSelector);
  const eventIdsAdded = Object.entries(events)
    .filter(([_, v]) => !!v)
    .map(([k]) => k as EventId);

  const addEvent = (eventId: EventId) => {
    dispatch({
      type: "ADD_EVENTS",
      eventIds: [eventId],
    });
  };
  const removeEvent = (eventId: EventId) => {
    dispatch({
      type: "REMOVE_EVENT",
      eventId,
    });
  };

  const eventRows = EVENT_IDS.map((eventId) => {
    const isAlreadyAdded = eventIdsAdded.includes(eventId);
    return (
      <TableRow key={eventId}>
        <TableCell>{EVENT_NAMES[eventId]}</TableCell>
        <TableCell align="right" sx={{ display: "flex" }}>
          <IconButton
            disabled={!isAlreadyAdded}
            onClick={() => removeEvent(eventId)}
          >
            <Clear color={isAlreadyAdded ? "error" : "disabled"} />
          </IconButton>
          <IconButton
            disabled={isAlreadyAdded}
            onClick={() => addEvent(eventId)}
          >
            <AddCircle color={isAlreadyAdded ? "disabled" : "primary"} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Accordion
          expanded={isExpanded}
          onChange={() => setIsExpanded(!isExpanded)}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Events</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: "flex", gap: "5em" }}>
            <TableContainer>
              <Table>
                <TableBody>{eventRows.filter((_, i) => !(i % 2))}</TableBody>
              </Table>
            </TableContainer>
            <TableContainer>
              <Table>
                <TableBody>{eventRows.filter((_, i) => i % 2)}</TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </>
  );
};

const AddEventsView = () => {
  return (
    <>
      <Typography sx={{ mb: 3 }} variant="h6">
        Add events
      </Typography>
      <AddEvents />
      <OtherActivities defaultExpanded />
    </>
  );
};

export default AddEventsView;
