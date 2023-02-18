import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import ReorderIcon from "@mui/icons-material/Reorder";
import { Round } from "../../types";
import { useDispatch, useSelector } from "../../app/hooks";
import { roundsSelector, startTimeSelector } from "../../app/selectors";
import { formatTime } from "../../utils/formatTime";
import { EVENT_NAMES } from "../../constants";
import { calcRoundNum, getRoundNumStr } from "../../utils/calculators";

type RoundWithTime = { round: Round; startTime: Date; endTime: Date };

const calcRoundTimes = (
  startTime: Date,
  rounds: Array<Round>
): Array<RoundWithTime> => {
  const roundsWithTimes: Array<RoundWithTime> = [];

  let currStartMs = startTime.getTime();

  rounds.forEach((round) => {
    const { scheduledTime } = round;
    const scheduledTimeMs = (scheduledTime || 0) * 60 * 1000;

    roundsWithTimes.push({
      round,
      startTime: new Date(currStartMs),
      endTime: new Date(currStartMs + scheduledTimeMs),
    });

    currStartMs += scheduledTimeMs;
  });

  return roundsWithTimes;
};

const ScheduleView = () => {
  const dispatch = useDispatch();

  const rounds = useSelector(roundsSelector);
  const startTime = useSelector(startTimeSelector);

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

  const roundsWithTimes = calcRoundTimes(startTime, rounds);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {roundsWithTimes.map(({ startTime, endTime, round }, index) => {
                const { eventId } = round;
                const roundNum = calcRoundNum(index, rounds);

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
                            <ListItemText>{EVENT_NAMES[eventId]}</ListItemText>
                            <ListItemText>
                              {getRoundNumStr(index, rounds)}
                            </ListItemText>
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
