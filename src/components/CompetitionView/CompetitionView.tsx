import React, { useEffect } from "react";
import { ChooseCompetition } from "./ChooseCompetition";
import { ConfigureCompetition } from "./ConfigureCompetition";
import { Grid } from "@mui/material";
import { useFetchCompetitions } from "../../hooks/useFetchCompetitions";

export const CompetitionView = () => {
  const hasFetchedCompetitions = useFetchCompetitions();

  if (!hasFetchedCompetitions) {
    return <>loading...</>;
  }

  return (
    <Grid container spacing={2}>
      <ChooseCompetition />
      <ConfigureCompetition />
    </Grid>
  );
};
