import { Divider, ListItem } from "@mui/material";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { DAYS_OF_WEEK } from "../../constants";

export const DayDivider = ({ startTime }: { startTime: Date }) => {
  return (
    <Divider sx={{ width: "100%" }} textAlign="left">
      {DAYS_OF_WEEK[startTime.getUTCDay()]}
    </Divider>
  );
};

export const DraggableDayDivider = ({
  startTime,
  index,
  id,
}: {
  startTime: Date;
  index: number;
  id: string;
}) => {
  // Don't allow the user to drag around the first day
  if (index === 0) {
    return (
      <ListItem sx={{ padding: 0 }}>
        <DayDivider startTime={startTime} />
      </ListItem>
    );
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <ListItem
            sx={{ padding: 0 }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DayDivider startTime={startTime} />
          </ListItem>
        );
      }}
    </Draggable>
  );
};
