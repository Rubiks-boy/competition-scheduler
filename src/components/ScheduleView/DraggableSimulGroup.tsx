import { getEventName, getRoundNumStr } from "../../utils/calculators";
import type {
  EventId,
  OtherActivity,
  ScheduleEntry,
  ScheduleWithTimes,
  SimulGroup,
  Round,
} from "../../types";
import { ListItem } from "@mui/material";
import { EditSimulScheduleDialog } from "./EditSimulRoundDialog";
import { Draggable } from "react-beautiful-dnd";

export const DraggableSimulGroup = ({
  simulGroup,
  heightPerGroup,
  scheduleWithTimes,
  scheduleEntry,
  round,
  getEventColor,
  index,
  id,
}: {
  simulGroup: SimulGroup;
  heightPerGroup: number;
  scheduleWithTimes: ScheduleWithTimes;
  scheduleEntry: ScheduleEntry;
  round: Round;
  getEventColor: (eventId: EventId | OtherActivity) => string;
  index: number;
  id: string;
}) => {
  const groupString = `Group ${simulGroup.groupOffset + 1}`;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => {
        return (
          <ListItem
            sx={{
              height: `${heightPerGroup}em`,
              borderRadius: "1em",
              backgroundColor: getEventColor(simulGroup.mainRound.eventId),
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
          </ListItem>
        );
      }}
    </Draggable>
  );
};
