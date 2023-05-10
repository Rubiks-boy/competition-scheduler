import React from "react";
import {
  Alert,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  stagesSelector,
  venueNameSelector,
  wcifScheduleSelector,
} from "../../app/selectors";
import type { Stage } from "../../types";
import { STAGE_NAMES_AND_COLORS } from "../../constants";

const VenueView = () => {
  const dispatch = useDispatch();
  const venueName = useSelector(venueNameSelector);
  const stages = useSelector(stagesSelector);

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

  const onStageChecked = (stage: Stage) => {
    dispatch({
      type: "STAGE_CHECKED",
      stage,
      checked: true,
    });
  };

  const onStageUnchecked = (stage: Stage) => {
    dispatch({
      type: "STAGE_CHECKED",
      stage,
      checked: false,
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
      {numExistingRooms === 0 && (
        <Grid container item xs={12}>
          <FormLabel>Stages</FormLabel>
          {STAGE_NAMES_AND_COLORS.map(({ stage, color }) => (
            <Grid item xs={12} key={stage}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stages.includes(stage)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      e.target.checked
                        ? onStageChecked(stage)
                        : onStageUnchecked(stage)
                    }
                    sx={{
                      color,
                      "&.Mui-checked": {
                        color,
                      },
                    }}
                  />
                }
                label={stage}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default VenueView;
