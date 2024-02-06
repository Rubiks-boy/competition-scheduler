import {
  ListItem,
  Box,
  Typography,
  Color,
  useMediaQuery,
  List,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { formatTime } from "../../utils/formatTime";
import { getEventName, getRoundNumStr } from "../../utils/calculators";
import type {
  EventId,
  OtherActivity,
  WithTime,
  ScheduleEntry,
  ScheduleWithTimes,
} from "../../types";
import { useSelector } from "../../app/hooks";
import { roundSelector } from "../../app/selectors";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import { range } from "../../utils/utils";
import { DraggableSimulGroup } from "./DraggableSimulGroup";

// in ems
const MIN_HEIGHT = 3;
const MAX_ADDITIONAL_HEIGHT = 10;

export const DraggableEvent = ({
  scheduleEntry,
  index,
  colors,
  scheduleWithTimes,
  id,
  isBeingCombinedWith,
}: {
  scheduleEntry: WithTime<ScheduleEntry>;
  index: number;
  colors: Partial<Record<EventId | OtherActivity, Color>>;
  scheduleWithTimes: ScheduleWithTimes;
  id: string;
  isBeingCombinedWith: boolean;
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const round = useSelector(
    scheduleEntry.type === "event"
      ? roundSelector(scheduleEntry.eventId, scheduleEntry.roundNum)
      : () => null
  );

  const { startTime, endTime, type } = scheduleEntry;

  const longestEventTime = Math.max(
    ...scheduleWithTimes.map(({ scheduledTimeMs }) => scheduledTimeMs)
  );
  const shortestEventTime = Math.min(
    // Require events to be at least 15 mins
    ...scheduleWithTimes.map(({ scheduledTimeMs }) =>
      Math.max(scheduledTimeMs, 15 * 60000)
    )
  );

  const roundNumStr =
    type === "event"
      ? ` ${getRoundNumStr(
          scheduleEntry.eventId,
          scheduleEntry.roundNum,
          scheduleWithTimes
        )}`
      : "";

  const getEventColor = (eventId: EventId | OtherActivity) => {
    const baseColor = colors[eventId] || grey;
    return baseColor[prefersDarkMode ? 800 : 300];
  };

  const height =
    MIN_HEIGHT +
    (Math.max(scheduleEntry.scheduledTimeMs - shortestEventTime, 0) /
      longestEventTime) *
      MAX_ADDITIONAL_HEIGHT;
  const numGroups = parseInt(round?.numGroups ?? "1");
  const heightPerGroup = height / numGroups;

  const getSimulGroup = (groupNum: number) => {
    return round?.simulGroups.filter((g) => g.groupOffset === groupNum)?.[0];
  };

  const lastGroupNumWithoutSimulEvent = range(numGroups).reduce(
    (currMax, i) => (getSimulGroup(i) ? currMax : i),
    -1
  );

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          sx={{
            backgroundColor: getEventColor(scheduleEntry.eventId),
            borderRadius: "1em",
            marginBlock: "1em",
            height: `${height}em`,
            justifyContent: "right",
            position: "relative",
            p: 0,
          }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="schedule-draggableEvent"
        >
          <Box
            sx={{
              textAlign: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography variant="body1">
              {`${getEventName(scheduleEntry.eventId)}${roundNumStr}`}
            </Typography>
            <Typography variant="body2">
              {`${formatTime(startTime)}-${formatTime(endTime)}`}
            </Typography>
          </Box>
          <Droppable
            droppableId={`simulGroup-${scheduleEntry.eventId}-${
              scheduleEntry.type === "event"
                ? scheduleEntry.roundNum
                : scheduleEntry.index
            }`}
            type="simulGroup"
          >
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <List sx={{ width: "20em" }}>
                  {round &&
                    range(numGroups).map((i) => {
                      const simulGroup = getSimulGroup(i);

                      const id = `simul-${round.eventId}-${
                        type === "event"
                          ? scheduleEntry.roundNum
                          : scheduleEntry.index
                      }-${i}`;

                      const isAnotherEventBeingDraggingOver =
                        snapshot.isDraggingOver &&
                        !!snapshot.draggingOverWith &&
                        !snapshot.draggingFromThisWith;

                      const shouldHide =
                        isAnotherEventBeingDraggingOver &&
                        i === lastGroupNumWithoutSimulEvent;

                      if (simulGroup) {
                        return (
                          <DraggableSimulGroup
                            key={id}
                            id={id}
                            index={i}
                            simulGroup={simulGroup}
                            heightPerGroup={heightPerGroup}
                            scheduleWithTimes={scheduleWithTimes}
                            scheduleEntry={scheduleEntry}
                            round={round}
                            getEventColor={getEventColor}
                          />
                        );
                      }

                      return (
                        <Draggable draggableId={id} index={i} isDragDisabled>
                          {(provided) => {
                            return (
                              <ListItem
                                sx={{
                                  height: `${heightPerGroup}em`,
                                  borderRadius: "1em",
                                  backgroundColor: "#80008088",
                                  visibility: snapshot.isDraggingOver
                                    ? "visible"
                                    : "hidden",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  pl: 3,
                                  pr: 1.5,
                                  ...(shouldHide ? { p: 0, height: 0 } : {}),
                                }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              ></ListItem>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </List>
              </div>
            )}
          </Droppable>
          {isBeingCombinedWith && (
            <Box
              sx={{
                width: "25%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                borderRadius: "1em",
                position: "absolute",
                right: 0,
                border: "3px dashed",
                // MUI's red[900]
                borderColor: "#B71C1CCC",
                backgroundColor: "#B71C1C88",
              }}
            >
              <MergeTypeIcon fontSize="medium" />
              Simultaneous
            </Box>
          )}
        </ListItem>
      )}
    </Draggable>
  );
};
