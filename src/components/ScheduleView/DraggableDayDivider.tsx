import { Divider, Grid, ListItem } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";
import { DAYS_OF_WEEK } from "../../constants";
import { TimePicker } from "../TimePicker";

const DayDivider = ({
  startTime,
  onStartTimeChange,
}: {
  startTime: Date;
  onStartTimeChange: (time: Date) => void;
}) => {
  return (
    <Grid container spacing={2} sx={{ alignItems: "center" }}>
      <Grid item xs={9}>
        <Divider sx={{ width: "100%" }} textAlign="left">
          {DAYS_OF_WEEK[startTime.getUTCDay()]}
        </Divider>
      </Grid>
      <Grid item xs={3}>
        <TimePicker
          sx={{ float: "right" }}
          label="Start time"
          time={startTime}
          onChange={onStartTimeChange}
        />
      </Grid>
    </Grid>
  );
};

export const DraggableDayDivider = ({
  startTime,
  index,
  onStartTimeChange,
  id,
}: {
  startTime: Date;
  onStartTimeChange: (time: Date) => void;
  index: number;
  id: string;
}) => {
  // Don't allow the user to drag around the first day
  if (index === 0) {
    return (
      <ListItem sx={{ p: 0, mt: 3 }}>
        <DayDivider
          startTime={startTime}
          onStartTimeChange={onStartTimeChange}
        />
      </ListItem>
    );
  }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <ListItem
            sx={{ p: 0, mt: 8 }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <DayDivider
              startTime={startTime}
              onStartTimeChange={onStartTimeChange}
            />
          </ListItem>
        );
      }}
    </Draggable>
  );
};
