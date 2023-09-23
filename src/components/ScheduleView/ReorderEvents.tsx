import { useMemo } from "react";
import { List, Color } from "@mui/material";
import { grey } from "@mui/material/colors";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  eventsSelector,
  otherActivitiesSelector,
  scheduleSelector,
  startTimeSelector,
} from "../../app/selectors";
import { EVENT_COLORS } from "../../constants";
import { calcScheduleTimes } from "../../utils/calculators";
import { EventId, OtherActivity, Schedule, ScheduleEntry } from "../../types";
import { DraggableEvent } from "./DraggableEvent";
import { DraggableDayDivider } from "./DraggableDayDivider";

const getColorsForActivities = (schedule: Schedule) => {
  const colors: Partial<Record<EventId | OtherActivity, Color>> = {};

  // List of all activities and events in the schedule
  const eventsList = [
    ...new Set(
      schedule
        .filter(({ type }) => type === "event")
        .map((scheduleEntry) => (scheduleEntry as ScheduleEntry).eventId)
    ),
  ];

  eventsList.forEach((event, index) => {
    colors[event] = EVENT_COLORS[index % EVENT_COLORS.length] || grey;
  });

  return colors;
};

export const ReorderEvents = () => {
  const dispatch = useDispatch();

  const schedule = useSelector(scheduleSelector);
  const events = useSelector(eventsSelector);
  const startTime = useSelector(startTimeSelector);
  const otherActivities = useSelector(otherActivitiesSelector);

  const colors = useMemo(() => {
    return getColorsForActivities(schedule);
    // Purposely excluding schedule from the dep array so that
    // colors remain constant whenever re-ordering events
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const scheduleWithTimes = calcScheduleTimes(
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
              {scheduleWithTimes.map((scheduleEntry, index) => {
                if (scheduleEntry.type === "day-divider") {
                  const id = `day-divider-${scheduleEntry.dayIndex}`;

                  return (
                    <DraggableDayDivider
                      key={id}
                      id={id}
                      index={index}
                      startTime={scheduleEntry.startTime}
                    />
                  );
                }

                const id =
                  scheduleEntry.type === "event"
                    ? `${scheduleEntry.eventId}-${scheduleEntry.roundNum}`
                    : `other-${scheduleEntry.eventId}`;

                return (
                  <DraggableEvent
                    key={id}
                    id={id}
                    scheduleEntry={scheduleEntry}
                    index={index}
                    colors={colors}
                    scheduleWithTimes={scheduleWithTimes}
                  />
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
