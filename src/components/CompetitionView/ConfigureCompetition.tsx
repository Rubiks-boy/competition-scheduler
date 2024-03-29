import { Info } from "@mui/icons-material";
import { Grid, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  competitorLimitRawSelector,
  numberOfDaysRawSelector,
  numStationsRawSelector,
  startTimesSelector,
  numCompetitorsRegisteredSelector,
} from "../../app/selectors";
import { TimePicker } from "../TimePicker";
import { NumStationsTooltip } from "./NumStationsTooltip";

export const ConfigureCompetition = () => {
  const dispatch = useDispatch();
  const competitorLimit = useSelector(competitorLimitRawSelector);
  const numStations = useSelector(numStationsRawSelector);
  const numberOfDays = useSelector(numberOfDaysRawSelector);
  const startTimes = useSelector(startTimesSelector);
  const competitorsPerStation =
    parseInt(competitorLimit) / parseInt(numStations);
  const numRegistered = useSelector(numCompetitorsRegisteredSelector);

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
      dayIndex: -1,
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
          InputProps={{
            endAdornment: numRegistered > 0 && (
              <InputAdornment position="end">
                <Tooltip
                  title={`Number of competitors registered: ${numRegistered}`}
                >
                  <Info color="info" fontSize="small" />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <TextField
          fullWidth
          label="Stations"
          type="number"
          value={numStations}
          onChange={onNumStationsChange}
          InputProps={{
            endAdornment: (
              <NumStationsTooltip
                competitorsPerStation={competitorsPerStation}
              />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TimePicker
          label="Start time"
          time={startTimes[0]}
          onChange={onStartTimeChange}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <TextField
          fullWidth
          label="Number of days"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="To edit, change the end date on the WCA site, come back to this page, and refresh.">
                  <Info color="disabled" fontSize="small" />
                </Tooltip>
              </InputAdornment>
            ),
          }}
          type="number"
          value={numberOfDays}
          onChange={onNumberOfDaysChange}
          disabled
        />
      </Grid>
    </>
  );
};
