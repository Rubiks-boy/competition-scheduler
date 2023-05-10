import React, { useState } from "react";
import {
  Alert,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { useSelector } from "../../app/hooks";
import { wcifScheduleSelector } from "../../app/selectors";

const STAGE_NAMES_AND_COLORS = [
  {
    name: "Red",
    color: "#963030",
  },
  {
    name: "Blue",
    color: "#304a96",
  },
  {
    name: "Green",
    color: "#309644",
  },
  {
    name: "Orange",
    color: "#e09635",
  },
];

const VenueView = () => {
  const originalWcifSchedule = useSelector(wcifScheduleSelector);
  const numExistingVenues = originalWcifSchedule?.venues.length || 0;
  const numExistingRooms = originalWcifSchedule?.venues?.[0]?.rooms.length || 0;

  const [venueName, setVenueName] = useState<String>("");

  const [activeStages, setActiveStages] = useState<Array<String>>([
    "Red",
    "Blue",
  ]);

  const onStageChecked = (stageName: string) => {
    setActiveStages((prev) => [...prev, stageName]);
  };

  const onStageUnchecked = (stageName: string) => {
    setActiveStages((prev) =>
      prev.filter((prevStage) => prevStage !== stageName)
    );
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
            onChange={(e) => setVenueName(e.target.value)}
          />
        </Grid>
      )}
      {numExistingRooms === 0 && (
        <Grid container item xs={12}>
          <FormLabel>Stages</FormLabel>
          {STAGE_NAMES_AND_COLORS.map(({ name, color }) => (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeStages.includes(name)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      e.target.checked
                        ? onStageChecked(name)
                        : onStageUnchecked(name)
                    }
                    sx={{
                      color,
                      "&.Mui-checked": {
                        color,
                      },
                    }}
                  />
                }
                label={name}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default VenueView;
