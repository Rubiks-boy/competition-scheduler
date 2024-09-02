import { IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { TimeDiffTooltip } from "./tooltips";
import { NumberTextField } from "../../NumberTextField";

export const ScheduledTimeInput = ({
  scheduledTime,
  calculatedTime,
  isEditingTime,
  onChange,
  setEditingTime,
}: {
  scheduledTime: string;
  calculatedTime: number;
  isEditingTime: boolean;
  onChange: (value: string) => void;
  setEditingTime: () => void;
}) => {
  return isEditingTime ? (
    <NumberTextField
      hiddenLabel
      size="small"
      value={scheduledTime}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ autoFocus: true, step: "5" }}
      InputProps={{
        endAdornment: scheduledTime && (
          <TimeDiffTooltip
            calculatedTime={calculatedTime}
            scheduledTime={parseInt(scheduledTime)}
          />
        ),
      }}
    />
  ) : (
    <div className="events-scheduledTime">
      <Typography>{scheduledTime}</Typography>
      <IconButton onClick={setEditingTime}>
        <Tooltip title="Edit scheduled time">
          <Edit color={"action"} fontSize="small" />
        </Tooltip>
      </IconButton>
    </div>
  );
};
