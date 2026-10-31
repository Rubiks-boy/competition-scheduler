import { IconButton, Tooltip, Typography } from "@mui/material";
import { useSelector } from "../../../app/hooks";
import { competitionStyleSelector } from "../../../app/selectors";
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
  const competitionStyle = useSelector(competitionStyleSelector);
  const roundingMinutes = competitionStyle === "runningJudges" ? 0.5 : 5;
  return isEditingTime ? (
    <NumberTextField
      hiddenLabel
      size="small"
      value={scheduledTime}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ step: roundingMinutes }}
      InputProps={{
        endAdornment: scheduledTime && (
          <TimeDiffTooltip
            calculatedTime={calculatedTime}
            roundingMinutes={roundingMinutes}
            scheduledTime={parseFloat(scheduledTime)}
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
