import { useDispatch, useSelector } from "../../app/hooks";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  addableEventIdsSelector,
  eventsSelector,
  numStationsSelector,
  numRegisteredByEventSelector,
} from "../../app/selectors";
import { Event } from "./Event";
import { OtherActivities } from "./OtherActivites";
import { AddEvent } from "./AddEvent";
import { ResetEventsButton } from "./ResetEventsButton";
import { EVENT_IDS } from "../../types";
import type { EventId } from "../../types";
import type {
  UpdatableRoundField,
  UpdatableSimulField,
} from "./RoundRow/types";

import "./index.css";

const EventsView = () => {
  const dispatch = useDispatch();

  const events = useSelector(eventsSelector);
  const addableEventIds = useSelector(addableEventIdsSelector);
  const numStations = useSelector(numStationsSelector);
  const numRegisteredByEvent = useSelector(numRegisteredByEventSelector);

  const makeOnUpdateRound = (eventId: EventId, roundNum: number) => {
    return (
      field: UpdatableRoundField,
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

  const makeOnUpdateSimulRound = (
    eventId: EventId,
    roundNum: number,
    mainRound: { eventId: EventId; roundNum: number }
  ) => {
    return (field: UpdatableSimulField, value: string) => {
      dispatch({
        type: "UPDATE_SIMUL_ROUND",
        eventId,
        roundNum,
        mainRound,
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
            makeOnUpdateSimulRound={makeOnUpdateSimulRound}
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
