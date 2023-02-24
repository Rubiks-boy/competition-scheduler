import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import ReorderIcon from "@mui/icons-material/Reorder";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  eventsSelector,
  otherActivitiesSelector,
  scheduleSelector,
  startTimeSelector,
} from "../../app/selectors";
import { formatTime } from "../../utils/formatTime";
import { EVENT_NAMES } from "../../constants";
import { calcScheduleTimes, getRoundNumStr } from "../../utils/calculators";

const ScheduleView = () => {
  const dispatch = useDispatch();

  const schedule = useSelector(scheduleSelector);
  const events = useSelector(eventsSelector);
  const startTime = useSelector(startTimeSelector);
  const otherActivities = useSelector(otherActivitiesSelector);

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

                return (
                  <Draggable key={id} draggableId={id} index={index}>
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
                            <ListItemText>{eventName}</ListItemText>
                            <ListItemText>{roundNumStr}</ListItemText>
                          </ListItemButton>
                        </ListItem>
                      </div>
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

export default ScheduleView;
