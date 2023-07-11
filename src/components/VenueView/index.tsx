import React from "react";
import { Alert, Grid, TextField } from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import { venueNameSelector, wcifScheduleSelector } from "../../app/selectors";
import { Stages } from "./Stages";

const VenueView = () => {
  const dispatch = useDispatch();
  const venueName = useSelector(venueNameSelector);

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
        <Alert severity="error">
          We currently don't support multi-venue competitions.
        </Alert>
      </div>
    );
  }

  if (numExistingVenues === 1 && numExistingRooms > 0) {
    return (
      <div>
        <Alert severity="success">
          Your website already has a venue with rooms! When you export your
          schedule, it'll export to every room automatically.
        </Alert>
      </div>
    );
  }

  return (
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
      {numExistingRooms === 0 && <Stages />}
    </Grid>
  );
};

export default VenueView;
