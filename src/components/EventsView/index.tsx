import { useDispatch, useSelector } from "../../app/hooks";
import {
  addableEventIdsSelector,
  eventsSelector,
  numStationsSelector,
  numRegisteredByEventSelector,
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
  const numRegisteredByEvent = useSelector(numRegisteredByEventSelector);

  const makeOnUpdateRound = (eventId: EventId, roundNum: number) => {
    return (
      field: "totalNumCompetitors" | "numGroups" | "scheduledTime",
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
            numRegistered={numRegisteredByEvent[eventId]}
            rounds={rounds}
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
