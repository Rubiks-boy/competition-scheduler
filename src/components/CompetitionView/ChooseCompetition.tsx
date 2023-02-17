import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  competitionSelected,
  currentCompSelector,
  manageableCompsSelector,
} from "../../app/competitionsSlice";

export const ChooseCompetition = () => {
  const manageableComps = useAppSelector(manageableCompsSelector);
  const selectedComps = useAppSelector(currentCompSelector);
  const dispatch = useAppDispatch();

  if (!selectedComps) {
    return null;
  }

  const handleChooseComp = (e: SelectChangeEvent<string | null>) => {
    const newId = e.target.value;

    if (!newId) {
      return;
    }

    dispatch(competitionSelected(newId));
  };

  return (
    <Grid container item xs={12}>
      <Grid item xs={12} md={8}>
        <FormControl fullWidth>
          <InputLabel id="choose-competition-label">Competition</InputLabel>
          <Select
            labelId="choose-competition-label"
            label="Competition"
            value={selectedComps.id}
            onChange={handleChooseComp}
          >
            {manageableComps.map(({ id, name }) => (
              <MenuItem value={id}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
