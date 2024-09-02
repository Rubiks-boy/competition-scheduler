import { getEventName, getRoundNumStr } from "../../utils/calculators";
import type { EventId, OtherActivity, ScheduleWithTimes } from "../../types";
import { IconButton, ListItem } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "../../app/hooks";
import { groupIndexSelector } from "../../app/selectors";
import { Clear, ContentCopy } from "@mui/icons-material";

export const DraggableSimulGroup = ({
  eventId,
  roundIndex,
  secondaryEventUnder,
  heightPerGroup,
  scheduleWithTimes,
  getEventColor,
  index,
  id,
  canDuplicateSimulGroups,
  onDuplicateSimulGroup,
  onDeleteSimulGroup,
}: {
  eventId: EventId;
  roundIndex: number;
  secondaryEventUnder: {
    eventId: EventId;
    roundIndex: number;
    groupIndex: number;
  };
  heightPerGroup: number;
  scheduleWithTimes: ScheduleWithTimes;
  getEventColor: (eventId: EventId | OtherActivity) => string;
  index: number;
  id: string;
  canDuplicateSimulGroups: boolean;
  onDuplicateSimulGroup: () => void;
  onDeleteSimulGroup: () => void;
}) => {
  const groupIndex =
    useSelector((state) =>
      groupIndexSelector(state, {
        eventId,
        roundIndex,
        secondaryEventUnder,
      })
    ) ?? 0;
  const groupString = `Group ${groupIndex + 1} `;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => {
        return (
          <ListItem
            sx={{
              height: `${heightPerGroup}em`,
              borderRadius: "1em",
              backgroundColor: getEventColor(eventId),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pl: 3,
              pr: 1.5,
            }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {getEventName(eventId)}{" "}
            {getRoundNumStr(eventId, roundIndex, scheduleWithTimes)}{" "}
            {groupString}
            <div>
              {canDuplicateSimulGroups && (
                <IconButton size="small" onClick={onDuplicateSimulGroup}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={onDeleteSimulGroup}>
                <Clear fontSize="small" />
              </IconButton>
            </div>
          </ListItem>
        );
      }}
    </Draggable>
  );
};
