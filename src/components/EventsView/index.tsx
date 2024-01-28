import { useDispatch, useSelector } from "../../app/hooks";
import {
  addableEventIdsSelector,
  eventsSelector,
  numStationsSelector,
} from "../../app/selectors";
import { Event } from "./Event";
import { EventId, EVENT_IDS } from "../../types";

import "./index.css";
import { OtherActivities } from "./OtherActivites";
import { AddEvent } from "./AddEvent";
import { Typography } from "@mui/material";
import { ResetEventsButton } from "./ResetEventsButton";
import { Box } from "@mui/system";

const EventsView = () => {
  const dispatch = useDispatch();

  const events = useSelector(eventsSelector);
  const addableEventIds = useSelector(addableEventIdsSelector);
  const numStations = useSelector(numStationsSelector);

  const makeOnUpdateRound = (eventId: EventId, roundNum: number) => {
    return (
      field: "numCompetitors" | "numGroups" | "scheduledTime",
      value: string,
      isEditingTime: boolean
    ) => {
      dispatch({
        type: "ROUND_UPDATED",
        eventId,
        roundNum,
        isEditingTime,
        [field]: value,
      });
    };
  };

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
          Events
        </Typography>
        <ResetEventsButton />
      </Box>
      {EVENT_IDS.map((eventId) => {
        const event = events[eventId];

        if (event == null) {
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
            numRegistered={event.numRegistered}
            rounds={event.rounds}
            numStations={numStations}
            makeOnUpdateRound={makeOnUpdateRound}
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
