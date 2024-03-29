import { SxProps, TextField } from "@mui/material";
import { formatTime } from "../utils/formatTime";

import "./TimePicker.css";

export const TimePicker = ({
  label,
  time,
  onChange,
  sx,
}: {
  label: string;
  time: Date;
  onChange: (time: Date) => void;
  sx?: SxProps;
}) => {
  const timeValue = formatTime(time);

  const onInputChange = (e: any) => {
    const rawTimeStr = e.target.value;

    const [hours, minutes] = rawTimeStr
      .split(":")
      .map((str: string) => parseInt(str, 10));

    const newTime = new Date(time?.getTime() || 0);
    newTime.setHours(hours, minutes);
    onChange(newTime);
  };

  return (
    <TextField
      fullWidth
      label={label}
      type="time"
      value={timeValue}
      onChange={onInputChange}
      sx={sx}
    />
  );
};
