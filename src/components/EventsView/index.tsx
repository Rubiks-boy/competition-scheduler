import React from "react";
import { useDispatch, useSelector } from "../../app/hooks";
import { eventsSelector, numStationsSelector } from "../../app/selectors";
import { Event } from "./Event";
import { EventId, EVENT_IDS } from "../../types";

import "./index.css";
import { OtherActivities } from "./OtherActivites";
import { AddEvent } from "./AddEvent";

const EventsView = () => {
  const dispatch = useDispatch();

  const events = useSelector(eventsSelector);
  const numStations = parseInt(useSelector(numStationsSelector) || "0");

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

  const addableEventIds = EVENT_IDS.filter(
    (eventId) => events[eventId] === null
  );
  const addEvents = (eventIds: Array<EventId>) => {
    console.log(eventIds);
    dispatch({
      type: "ADD_EVENTS",
      eventIds,
    });
  };

  return (
    <>
      {EVENT_IDS.map((eventId) => {
        const rounds = events[eventId];

        if (rounds === null) {
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
