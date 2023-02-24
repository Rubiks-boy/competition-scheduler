import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import ReorderIcon from "@mui/icons-material/Reorder";
import { EventId, Events, Schedule } from "../../types";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  eventsSelector,
  scheduleSelector,
  startTimeSelector,
} from "../../app/selectors";
import { formatTime } from "../../utils/formatTime";
import { EVENT_NAMES } from "../../constants";
import { getRoundNumStr } from "../../utils/calculators";

type RoundWithTime = {
  eventId: EventId;
  roundNum: number;
  startTime: Date;
  endTime: Date;
};

const calcRoundTimes = (
  startTime: Date,
  schedule: Schedule,
  events: Events
): Array<RoundWithTime> => {
  const roundsWithTimes: Array<RoundWithTime> = [];

  let currStartMs = startTime.getTime();

  schedule.forEach(({ eventId, roundNum }) => {
    const round = events[eventId][roundNum];
    const { scheduledTime } = round;
    const scheduledTimeMs = (scheduledTime || 0) * 60 * 1000;

    roundsWithTimes.push({
      eventId,
      roundNum,
      startTime: new Date(currStartMs),
      endTime: new Date(currStartMs + scheduledTimeMs),
    });

    currStartMs += scheduledTimeMs;
  });

  return roundsWithTimes;
};

const ScheduleView = () => {
  const dispatch = useDispatch();

  const schedule = useSelector(scheduleSelector);
  const events = useSelector(eventsSelector);
  const startTime = useSelector(startTimeSelector);

  const onDragEnd: OnDragEndResponder = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    dispatch({
      type: "REORDER_ROUND",
    });
  };

  const roundsWithTimes = calcRoundTimes(startTime, schedule, events);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {roundsWithTimes.map(
                ({ startTime, endTime, eventId, roundNum }, index) => {
                  return (
                    <Draggable
                      key={`${eventId}-${roundNum}`}
                      draggableId={`${eventId}-${roundNum}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ListItem>
                            <ListItemButton>
                              <ReorderIcon />
                              <ListItemText>
                                {`${formatTime(startTime)}-${formatTime(
                                  endTime
                                )}`}
                              </ListItemText>
                              <ListItemText>
                                {EVENT_NAMES[eventId]}
                              </ListItemText>
                              <ListItemText>
                                {getRoundNumStr(eventId, roundNum, schedule)}
                              </ListItemText>
                            </ListItemButton>
                          </ListItem>
                        </div>
                      )}
                    </Draggable>
                  );
                }
              )}
              {provided.placeholder}
            </List>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ScheduleView;
