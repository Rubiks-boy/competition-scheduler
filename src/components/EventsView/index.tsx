import React from "react";
import { useDispatch, useSelector } from "../../app/hooks";
import { eventsSelector, numStationsSelector } from "../../app/selectors";
import { Event } from "./Event";
import { EventId, EVENT_IDS } from "../../types";

import "./index.css";
import { OtherActivities } from "./OtherActivites";

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
        [field]: parseInt(value, 10),
      });
    };
  };

  return (
    <>
      {EVENT_IDS.map((eventId) => {
        const rounds = events[eventId];

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
    </>
  );
};

export default EventsView;
