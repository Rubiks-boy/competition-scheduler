import React from "react";
import { List, ListItem, Box, Typography, Color } from "@mui/material";
import { grey } from "@mui/material/colors";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  eventsSelector,
  otherActivitiesSelector,
  scheduleSelector,
  startTimeSelector,
} from "../../app/selectors";
import { formatTime } from "../../utils/formatTime";
import { EVENT_COLORS, EVENT_NAMES } from "../../constants";
import { calcScheduleTimes, getRoundNumStr } from "../../utils/calculators";
import { EventId, OtherActivity, Schedule } from "../../types";

// in ems
const MIN_HEIGHT = 3;
const MAX_ADDITIONAL_HEIGHT = 10;

const getColorsForActivities = (schedule: Schedule) => {
  const colors: Partial<Record<EventId | OtherActivity, Color>> = {};

  // List of all activities and events in the schedule
  const activitiesList = [
    ...new Set(
      schedule.map((scheduleEntry) =>
        scheduleEntry.type === "event"
          ? scheduleEntry.eventId
          : scheduleEntry.activity
      )
    ),
  ];

  activitiesList.forEach((activity, index) => {
    colors[activity] = EVENT_COLORS[index % EVENT_COLORS.length] || grey;
  });

  return colors;
};

export const ReorderEvents = () => {
  const dispatch = useDispatch();

  const schedule = useSelector(scheduleSelector);
  const events = useSelector(eventsSelector);
  const startTime = useSelector(startTimeSelector);
  const otherActivities = useSelector(otherActivitiesSelector);

  const colors = getColorsForActivities(schedule);

  const onDragEnd: OnDragEndResponder = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    dispatch({
      type: "REORDER_ROUND",
      oldIndex: result.source.index,
      newIndex: result.destination.index,
    });
  };

  const roundsWithTimes = calcScheduleTimes(
    startTime,
    schedule,
    events,
    otherActivities
  );

  const longestEventTime = Math.max(
    ...roundsWithTimes.map(({ scheduledTimeMs }) => scheduledTimeMs)
  );
  const shortestEventTime = Math.min(
    // Require events to be at least 15 mins
    ...roundsWithTimes.map(({ scheduledTimeMs }) =>
      Math.max(scheduledTimeMs, 15 * 60000)
    )
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {roundsWithTimes.map((scheduleEntry, index) => {
                const { startTime, endTime, type } = scheduleEntry;

                const eventName =
                  type === "event"
                    ? EVENT_NAMES[scheduleEntry.eventId]
                    : scheduleEntry.activity;

                const roundNumStr =
                  type === "event"
                    ? getRoundNumStr(
                        scheduleEntry.eventId,
                        scheduleEntry.roundNum,
                        schedule
                      )
                    : "";

                const id =
                  type === "event"
                    ? `${scheduleEntry.eventId}-${scheduleEntry.roundNum}`
                    : `other-${scheduleEntry.activity}`;

                const baseColor =
                  colors[
                    type === "event"
                      ? scheduleEntry.eventId
                      : scheduleEntry.activity
                  ] || grey;

                const backgroundColor =
                  // @ts-expect-error this will always be a valid color.
                  baseColor[800 - 100 * scheduleEntry.roundNum];

                console.log(
                  MIN_HEIGHT,
                  scheduleEntry.scheduledTimeMs,
                  shortestEventTime,
                  longestEventTime
                );
                const height = `${
                  MIN_HEIGHT +
                  (Math.max(
                    scheduleEntry.scheduledTimeMs - shortestEventTime,
                    0
                  ) /
                    longestEventTime) *
                    MAX_ADDITIONAL_HEIGHT
                }em`;

                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        sx={{
                          backgroundColor,
                          borderRadius: "1em",
                          marginBlock: "1em",
                          height,
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Box>
                          <Typography variant="body1">
                            {eventName} {roundNumStr}
                          </Typography>
                          <Typography variant="body2">
                            {`${formatTime(startTime)}-${formatTime(endTime)}`}
                          </Typography>
                        </Box>
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
