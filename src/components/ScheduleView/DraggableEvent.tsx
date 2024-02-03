import { ListItem, Box, Typography, Color, useMediaQuery } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Draggable } from "react-beautiful-dnd";
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
import { EditSimulScheduleDialog } from "./EditSimulRoundDialog";

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

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <ListItem
          sx={{
            backgroundColor: getEventColor(scheduleEntry.eventId),
            borderRadius: "1em",
            marginBlock: "1em",
            height: `${height}em`,
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
              {`${getEventName(scheduleEntry.eventId)}${roundNumStr}`}
            </Typography>
            <Typography variant="body2">
              {`${formatTime(startTime)}-${formatTime(endTime)}`}
            </Typography>
            {round &&
              round.simulGroups.map((simulGroup) => {
                const numSimulGroups = parseInt(simulGroup.mainRound.numGroups);
                const groupString =
                  numSimulGroups > 1
                    ? `Groups ${simulGroup.groupOffset + 1}–${
                        simulGroup.groupOffset + numSimulGroups
                      }`
                    : `Group ${simulGroup.groupOffset + 1}`;

                const simulHeight =
                  (100 * Math.min(numSimulGroups, numGroups)) / numGroups;
                const top = (height / numGroups) * simulGroup.groupOffset;

                return (
                  <Box
                    key={`${simulGroup.mainRound.eventId}-${simulGroup.mainRound.roundNum}`}
                    sx={{
                      width: "40%",
                      height: `${simulHeight}%`,
                      position: "absolute",
                      right: 0,
                      top: `${top}em`,
                      borderRadius: "1em",
                      backgroundColor: getEventColor(
                        simulGroup.mainRound.eventId
                      ),
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pl: 3,
                      pr: 1.5,
                    }}
                  >
                    {getEventName(simulGroup.mainRound.eventId)}{" "}
                    {getRoundNumStr(
                      simulGroup.mainRound.eventId,
                      simulGroup.mainRound.roundNum,
                      scheduleWithTimes
                    )}{" "}
                    {groupString}
                    {scheduleEntry.type === "event" && (
                      <EditSimulScheduleDialog
                        primaryRound={round}
                        primaryScheduleEntry={scheduleEntry}
                        secondaryEventId={simulGroup.mainRound.eventId}
                        secondaryRoundNum={simulGroup.mainRound.roundNum}
                      />
                    )}
                  </Box>
                );
              })}
          </Box>
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
