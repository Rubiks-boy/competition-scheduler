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
import {
  getRoundSelector,
  groupIndexSelector,
  showAdvancedSelector,
  getSimulGroupsForEventSelector,
} from "../../app/selectors";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import { range } from "../../utils/utils";
import { DraggableSimulGroup } from "./DraggableSimulGroup";
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
  const round = useSelector(getRoundSelector)(scheduleEntry);
  const showAdvanced = useSelector(showAdvancedSelector);
  const numGroups =
    round?.type === "groups"
      ? round?.groups.length
      : parseInt(round?.numGroups ?? "1");

  const getSimulGroupsForEvent = useSelector(getSimulGroupsForEventSelector);
  const hasOtherSimulGroups =
    scheduleEntry.type === "event" &&
    !!getSimulGroupsForEvent({
      eventId: scheduleEntry.eventId,
      roundIndex: scheduleEntry.roundNum,
    }).length;

  const hasGroupsSimulWithCurrRound =
    round?.type === "groups" &&
    round.groups.some((group) => group.secondaryEvent);

  const groupIndex = useSelector((state) =>
    scheduleEntry.type === "event"
      ? groupIndexSelector(state, {
          eventId: scheduleEntry.eventId,
          roundIndex: scheduleEntry.roundNum,
          secondaryEventUnder: null,
        })
      : null
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

  let groupStr = "";
  if (hasOtherSimulGroups && groupIndex !== null) {
    groupStr =
      numGroups > 1
        ? ` Groups ${groupIndex + 1}-${groupIndex + numGroups}`
        : ` Group ${groupIndex + 1}`;
  }

  const getEventColor = (eventId: EventId | OtherActivity) => {
    const baseColor = colors[eventId] || grey;
    return baseColor[prefersDarkMode ? 800 : 300];
  };

  const height =
    MIN_HEIGHT +
    (Math.max(scheduleEntry.scheduledTimeMs - shortestEventTime, 0) /
      longestEventTime) *
      MAX_ADDITIONAL_HEIGHT;
  const heightPerGroup = height / numGroups;

  const lastGroupNumWithoutSimulEvent = range(numGroups).reduce(
    (currMax, i) =>
      round?.type === "groups" && round.groups[i].secondaryEvent ? currMax : i,
    -1
  );

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <ListItem
          sx={{
            backgroundColor: getEventColor(scheduleEntry.eventId),
            borderRadius: "1em",
            marginBlock: "1em",
            height: `${height}em`,
            justifyContent: "right",
            position: "relative",
            p: 0,
            display: "flex",
            overflow: "clip",
          }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="schedule-draggableEvent"
        >
          <Box
            sx={{
              position: "absolute",
              left: 0,
              height: "100%",
              display: "flex",
            }}
          >
            {scheduleEntry.type === "event" &&
              (hasGroupsSimulWithCurrRound || showAdvanced) && (
                <EditSimulScheduleDialog
                  eventId={scheduleEntry.eventId}
                  roundIndex={scheduleEntry.roundNum}
                />
              )}
          </Box>
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
              {`${getEventName(
                scheduleEntry.eventId
              )}${roundNumStr}${groupStr}`}
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

                      const group =
                        round.type === "groups" ? round.groups[i] : undefined;
                      if (
                        scheduleEntry.type === "event" &&
                        round.type === "groups" &&
                        group?.secondaryEvent
                      ) {
                        return (
                          <DraggableSimulGroup
                            key={id}
                            id={id}
                            index={i}
                            eventId={group.secondaryEvent.eventId}
                            roundIndex={group.secondaryEvent.roundIndex}
                            secondaryEventUnder={{
                              eventId: round.eventId,
                              roundIndex: scheduleEntry.roundNum,
                              groupIndex: i,
                            }}
                            heightPerGroup={heightPerGroup}
                            scheduleWithTimes={scheduleWithTimes}
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
