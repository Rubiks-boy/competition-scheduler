import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";

const manageableCompetitions = [
  { id: "BobcatBattle2023", name: "Bobcat Battle 2023" },
  { id: "SleeplessinSeattle2023", name: "Sleepless in Seattle 2023" },
];

export const ChooseCompetition = () => {
  const [selectedCompetition, setSelectedCompetition] = useState(
    manageableCompetitions[0].id
  );

  const handleChooseComp = (e: SelectChangeEvent<string | null>) => {
    if (e.target.value) {
      setSelectedCompetition(e.target.value);
    }
  };

  return (
    <Grid container item xs={12}>
      <Grid item xs={12} md={8}>
        <FormControl fullWidth>
          <InputLabel id="choose-competition-label">Competition</InputLabel>
          <Select
            labelId="choose-competition-label"
            label="Competition"
            value={selectedCompetition}
            onChange={handleChooseComp}
          >
            {manageableCompetitions.map(({ id, name }) => (
              <MenuItem value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
