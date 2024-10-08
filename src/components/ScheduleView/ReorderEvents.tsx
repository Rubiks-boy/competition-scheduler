import { useMemo, useState } from "react";
import { List, Color } from "@mui/material";
import { grey } from "@mui/material/colors";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  eventsSelector,
  numberOfDaysSelector,
  otherActivitiesSelector,
  scheduleSelector,
  startTimesSelector,
} from "../../app/selectors";
import { EVENT_COLORS } from "../../constants";
import { calcScheduleTimes } from "../../utils/calculators";
import { EventId, OtherActivity, Schedule, ScheduleEntry } from "../../types";
import { DraggableEvent } from "./DraggableEvent";
import { DraggableDayDivider } from "./DraggableDayDivider";

const getRoundFromDroppableId = (droppableId: string) => {
  const split = droppableId.split("-");
  if (split.length !== 3 || split[0] !== "simulGroup") {
    return null;
  }

  return { eventId: split[1] as EventId, roundNum: parseInt(split[2]) };
};

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
  const startTimes = useSelector(startTimesSelector);
  const otherActivities = useSelector(otherActivitiesSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);

  const [idBeingCombinedWith, setIdBeingCombinedWith] = useState<string | null>(
    null
  );

  const colors = useMemo(() => {
    return getColorsForActivities(schedule);
    // Purposely excluding schedule from the dep array so that
    // colors remain constant whenever re-ordering events
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleWithTimes = calcScheduleTimes(
    startTimes,
    schedule,
    events,
    otherActivities
  );

  const draggableIds = scheduleWithTimes.map((scheduleEntry) => {
    if (scheduleEntry.type === "day-divider") {
      return `day-divider-${scheduleEntry.dayIndex}`;
    } else if (scheduleEntry.type === "event") {
      return `${scheduleEntry.eventId}-${scheduleEntry.roundNum}`;
    } else {
      return `other-${scheduleEntry.eventId}-${
        "index" in scheduleEntry ? scheduleEntry.index : "0"
      }`;
    }
  });

  const onDragUpdate: OnDragUpdateResponder = (update) => {
    const combinedWithId = update.combine?.draggableId ?? null;

    const canSetId = (): boolean => {
      const sourceIndex = update.source.index;
      const destDraggableId = update.combine?.draggableId;
      if (!destDraggableId) {
        return false;
      }
      const destIndex = draggableIds.indexOf(destDraggableId);

      const sourceScheduleEntry = schedule[sourceIndex];
      const destScheduleEntry = schedule[destIndex];

      return (
        sourceScheduleEntry.type === "event" &&
        destScheduleEntry.type === "event"
      );
    };

    setIdBeingCombinedWith(canSetId() ? combinedWithId : null);
  };

  const onReorderRound: OnDragEndResponder = (result) => {
    if (result.destination) {
      dispatch({
        type: "REORDER_ROUND",
        oldIndex: result.source.index,
        newIndex: result.destination.index,
      });
    } else if (result.combine) {
      const { draggableId } = result.combine;
      const combinedWithIndex = draggableIds.indexOf(draggableId);

      if (draggableId.startsWith("day-divider") || !combinedWithIndex) {
        return;
      }

      dispatch({
        type: "CREATE_SIMUL_GROUP",
        sourceIndex: result.source.index,
        destinationIndex: draggableIds.indexOf(result.combine.draggableId),
      });
      setIdBeingCombinedWith(null);
    }
  };

  const onReorderSimulGroup: OnDragEndResponder = (result, provided) => {
    if (!result.destination) {
      return;
    }

    const startingRound = getRoundFromDroppableId(result.source.droppableId);
    const endingRound = getRoundFromDroppableId(result.destination.droppableId);

    if (!startingRound || !endingRound) {
      return;
    }

    dispatch({
      type: "REORDER_SIMUL_GROUP",
      startingLocation: {
        eventId: startingRound.eventId,
        roundIndex: startingRound.roundNum,
        groupIndex: result.source.index,
      },
      endingLocation: {
        eventId: endingRound.eventId,
        roundIndex: endingRound.roundNum,
        groupIndex: result.destination.index,
      },
    });
  };

  const onDuplicateSimulGroup = ({
    mainEvent,
    numCompetitors,
  }: {
    mainEvent: { eventId: EventId; roundNum: number; groupIndex: number };
    numCompetitors: string;
  }) => {
    dispatch({
      type: "DUPLICATE_SIMUL_GROUP",
      mainEvent,
      numCompetitors,
    });
  };

  const onDeleteSimulGroup = (
    eventId: EventId,
    roundIndex: number,
    groupIndex: number
  ) => {
    dispatch({
      type: "DELETE_SIMUL_GROUP",
      eventId,
      roundIndex,
      groupIndex,
    });
  };

  const onDragEnd: OnDragEndResponder = (result, provided) => {
    if (result.type === "round") {
      onReorderRound(result, provided);
    } else if (result.type === "simulGroup") {
      onReorderSimulGroup(result, provided);
    }
  };

  const onStartTimeChange = (dayIndex: number) => (startTime: Date) => {
    dispatch({
      type: "START_TIME_CHANGED",
      dayIndex,
      startTime,
    });
  };

  return (
    <DragDropContext onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
      <Droppable droppableId="round" type="round" isCombineEnabled>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {scheduleWithTimes.map((scheduleEntry, index) => {
                if (scheduleEntry.type === "day-divider") {
                  const id = `day-divider-${scheduleEntry.dayIndex}`;

                  return (
                    numberOfDays > 1 && (
                      <DraggableDayDivider
                        key={id}
                        id={id}
                        index={index}
                        startTime={scheduleEntry.startTime}
                        onStartTimeChange={onStartTimeChange(
                          scheduleEntry.dayIndex
                        )}
                      />
                    )
                  );
                }

                const id =
                  scheduleEntry.type === "event"
                    ? `${scheduleEntry.eventId}-${scheduleEntry.roundNum}`
                    : `other-${scheduleEntry.eventId}-${
                        "index" in scheduleEntry ? scheduleEntry.index : "0"
                      }`;

                if (!scheduleEntry.scheduledTimeMs) {
                  return null;
                }

                return (
                  <DraggableEvent
                    key={id}
                    id={id}
                    scheduleEntry={scheduleEntry}
                    index={index}
                    colors={colors}
                    scheduleWithTimes={scheduleWithTimes}
                    isBeingCombinedWith={id === idBeingCombinedWith}
                    onDuplicateSimulGroup={onDuplicateSimulGroup}
                    onDeleteSimulGroup={onDeleteSimulGroup}
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
