import { TextField } from "@mui/material";
import { formatTime } from "../utils/formatTime";

export const TimePicker = ({
  label,
  time,
  onChange,
}: {
  label: string;
  time: Date;
  onChange: (time: Date) => void;
}) => {
  const timeValue = formatTime(time);

  const onInputChange = (e: any) => {
    const rawTimeStr = e.target.value;

    const [hours, minutes] = rawTimeStr
      .split(":")
      .map((str: string) => parseInt(str, 10));

    const newTime = new Date(time?.getMilliseconds() || 0);
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
    />
  );
};
