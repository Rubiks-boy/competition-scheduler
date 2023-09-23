import { ListItem, Box, Typography, Color, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Draggable } from "react-beautiful-dnd";
import { formatTime } from "../../utils/formatTime";
import { ACTIVITY_NAMES, EVENT_NAMES } from "../../constants";
import { getRoundNumStr } from "../../utils/calculators";
import type {
  EventId,
  OtherActivity,
  WithTime,
  ScheduleEntry,
  ScheduleWithTimes,
} from "../../types";

// in ems
const MIN_HEIGHT = 3;
const MAX_ADDITIONAL_HEIGHT = 10;

export const DraggableEvent = ({
  scheduleEntry,
  index,
  colors,
  scheduleWithTimes,
  id,
}: {
  scheduleEntry: WithTime<ScheduleEntry>;
  index: number;
  colors: Partial<Record<EventId | OtherActivity, Color>>;
  scheduleWithTimes: ScheduleWithTimes;
  id: string;
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

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

  const eventName =
    type === "event"
      ? EVENT_NAMES[scheduleEntry.eventId]
      : ACTIVITY_NAMES[scheduleEntry.eventId];

  const roundNumStr =
    type === "event"
      ? ` ${getRoundNumStr(
          scheduleEntry.eventId,
          scheduleEntry.roundNum,
          scheduleWithTimes
        )}`
      : "";

  const baseColor = colors[scheduleEntry.eventId] || grey;

  const backgroundColor = baseColor[prefersDarkMode ? 800 : 300];

  const height = `${
    MIN_HEIGHT +
    (Math.max(scheduleEntry.scheduledTimeMs - shortestEventTime, 0) /
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
          className="schedule-draggableEvent"
        >
          <Box>
            <Typography variant="body1">
              {`${eventName}${roundNumStr}`}
            </Typography>
            <Typography variant="body2">
              {`${formatTime(startTime)}-${formatTime(endTime)}`}
            </Typography>
          </Box>
        </ListItem>
      )}
    </Draggable>
  );
};
