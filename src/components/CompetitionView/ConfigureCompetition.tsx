import { Grid, TextField } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import { numStationsSelector, startTimeSelector } from "../../app/selectors";
import { TimePicker } from "../TimePicker";

export const ConfigureCompetition = () => {
  const dispatch = useDispatch();
  const numStations = useSelector(numStationsSelector);
  const startTime = useSelector(startTimeSelector);

  const onNumStationsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: "NUM_STATIONS_CHANGED",
      numStations: e.target.value,
    });
  };

  const onStartTimeChange = (startTime: Date) => {
    dispatch({
      type: "START_TIME_CHANGED",
      startTime,
    });
  };

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Stations"
          type="number"
          value={numStations}
          onChange={onNumStationsChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TimePicker
          label="Start time"
          time={startTime}
          onChange={onStartTimeChange}
        />
      </Grid>
    </>
  );
};
