import React from "react";
import {
  Alert,
  FormControlLabel,
  FormLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  isUsingCustomStagesSelector,
  venueNameSelector,
  wcifScheduleSelector,
} from "../../app/selectors";
import { Stages } from "./Stages";
import { CustomStages } from "./CustomStages";

const VenueView = () => {
  const dispatch = useDispatch();
  const venueName = useSelector(venueNameSelector);
  const isUsingCustomStages = useSelector(isUsingCustomStagesSelector);

  const originalWcifSchedule = useSelector(wcifScheduleSelector);
  const numExistingVenues = originalWcifSchedule?.venues.length || 0;
  const numExistingRooms = originalWcifSchedule?.venues?.[0]?.rooms.length || 0;

  const onVenueNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const venueName = e.target.value;

    dispatch({
      type: "VENUE_NAME_CHANGED",
      venueName,
    });
  };

  if (numExistingVenues > 1) {
    return (
      <div>
        <Typography sx={{ mb: 3 }} variant="h6">
          Venue
        </Typography>
        <Alert severity="error">
          We currently don't support multi-venue competitions.
        </Alert>
      </div>
    );
  }

  if (numExistingVenues === 1 && numExistingRooms > 0) {
    return (
      <div>
        <Typography sx={{ mb: 3 }} variant="h6">
          Venue
        </Typography>
        <Alert severity="success">
          Your website already has a venue with rooms! When you export your
          schedule, it'll export to every room automatically.
        </Alert>
      </div>
    );
  }

  const setUsingCustomStages = () => {
    dispatch({
      type: "USING_CUSTOM_STAGES_TOGGLED",
      isUsingCustomStages: !isUsingCustomStages,
    });
  };

  return (
    <>
      <Typography sx={{ mb: 3 }} variant="h6">
        Venue
      </Typography>
      <Grid container spacing={2}>
        {numExistingVenues === 0 && (
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Name"
              type="string"
              value={venueName}
              onChange={onVenueNameChange}
            />
          </Grid>
        )}
        <Grid container item xs={12} spacing={2}>
          <Grid
            item
            xs={3}
            sx={{ mb: 0, alignItems: "center", display: "flex" }}
          >
            <FormLabel>Stages</FormLabel>
          </Grid>
          <Grid item xs={9} sx={{ justifyContent: "right", display: "flex" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isUsingCustomStages}
                  onChange={setUsingCustomStages}
                  size="small"
                />
              }
              label="Custom stages"
            />
          </Grid>
          {numExistingRooms === 0 && isUsingCustomStages && <CustomStages />}
          {numExistingRooms === 0 && !isUsingCustomStages && <Stages />}
        </Grid>
      </Grid>
    </>
  );
};

export default VenueView;
