import { Grid, TextField } from "@mui/material";
import { TimePicker } from "../TimePicker";

export const ConfigureCompetition = () => {
  const numStations = 8;
  const startTime = new Date(0);

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label="Stations"
          type="number"
          value={numStations}
          onChange={() => {}}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TimePicker label="Start time" time={startTime} onChange={() => {}} />
      </Grid>
    </>
  );
};
