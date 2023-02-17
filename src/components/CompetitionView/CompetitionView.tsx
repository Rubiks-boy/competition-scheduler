import React from "react";
import { ChooseCompetition } from "./ChooseCompetition";
import { ConfigureCompetition } from "./ConfigureCompetition";
import { Grid } from "@mui/material";

export const CompetitionView = () => {
  return (
    <Grid container spacing={2}>
      <ChooseCompetition />
      <ConfigureCompetition />
    </Grid>
  );
};
