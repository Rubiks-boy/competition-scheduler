import { IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { TimeDiffTooltip } from "./tooltips";
import type { Round } from "../../../types";
import { calcTimeForRound } from "../../../utils/calculators";

export const ScheduledTimeInput = ({
  round,
  isEditingTime,
  onChange,
  setEditingTime,
}: {
  round: Round;
  isEditingTime: boolean;
  onChange: (value: string) => void;
  setEditingTime: () => void;
}) => {
  const { eventId, numGroups, scheduledTime } = round;

  const calculatedTime = calcTimeForRound(eventId, parseInt(numGroups || "0"));
  const timeDiff = Math.abs(calculatedTime - parseInt(scheduledTime));

  return isEditingTime ? (
    <TextField
      hiddenLabel
      size="small"
      type="number"
      value={scheduledTime}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ autoFocus: true, step: "5" }}
      InputProps={{
        endAdornment: scheduledTime && (
          <TimeDiffTooltip
            calculatedTime={calculatedTime}
            timeDiff={timeDiff}
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
