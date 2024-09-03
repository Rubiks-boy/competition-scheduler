import { useDispatch, useSelector } from "../../app/hooks";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { addableEventIdsSelector, eventsSelector } from "../../app/selectors";
import { Event } from "./Event";
import { OtherActivities } from "./OtherActivites";
import { AddEvent } from "./AddEvent";
import { ResetEventsButton } from "./ResetEventsButton";
import { EVENT_IDS } from "../../types";
import type { EventId } from "../../types";

import "./index.css";

const EventsView = () => {
  const dispatch = useDispatch();

  const events = useSelector(eventsSelector);
  const addableEventIds = useSelector(addableEventIdsSelector);

  const addEvents = (eventIds: Array<EventId>) => {
    dispatch({
      type: "ADD_EVENTS",
      eventIds,
    });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ mb: 3 }} variant="h6">
          Rounds
        </Typography>
        <ResetEventsButton />
      </Box>
      {EVENT_IDS.map((eventId) => {
        const rounds = events[eventId];

        if (!rounds) {
          return null;
        }

        const onAddRound = () =>
          dispatch({
            type: "ADD_ROUND",
            eventId,
          });

        const onRemoveRound = () =>
          dispatch({
            type: "REMOVE_ROUND",
            eventId,
          });

        return (
          <Event
            key={eventId}
            eventId={eventId}
            rounds={rounds}
            onAddRound={onAddRound}
            onRemoveRound={onRemoveRound}
          />
        );
      })}
      <OtherActivities />
      <AddEvent eventIdOptions={addableEventIds} addEvents={addEvents} />
    </>
  );
};

export default EventsView;
