import { Grid, TextField } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  competitorLimitSelector,
  numStationsSelector,
  startTimeSelector,
  numberOfDaysSelector,
} from "../../app/selectors";
import { TimePicker } from "../TimePicker";

export const ConfigureCompetition = () => {
  const dispatch = useDispatch();
  const competitorLimit = useSelector(competitorLimitSelector);
  const numStations = useSelector(numStationsSelector);
  const startTime = useSelector(startTimeSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);

  const onCompetitorLimitChanged = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: "COMPETITOR_LIMIT_CHANGED",
      competitorLimit: e.target.value,
    });
  };

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

  const onNumberOfDaysChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: "NUMBER_OF_DAYS_CHANGED",
      numberOfDays: e.target.value,
    });
  };

  return (
    <>
      <Grid item xs={6} sm={4} md={3}>
        <TextField
          fullWidth
          label="Competitor Limit"
          type="number"
          value={competitorLimit}
          onChange={onCompetitorLimitChanged}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <TextField
          fullWidth
          label="Stations"
          type="number"
          value={numStations}
          onChange={onNumStationsChange}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TimePicker
          label="Start time"
          time={startTime}
          onChange={onStartTimeChange}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          fullWidth
          label="Number of days"
          type="number"
          value={numberOfDays}
          onChange={onNumberOfDaysChange}
        />
      </Grid>
    </>
  );
};
