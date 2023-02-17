import React from "react";
import { ChooseCompetition } from "./ChooseCompetition";
import { ConfigureCompetition } from "./ConfigureCompetition";
import { Grid } from "@mui/material";
import { useSelector } from "../../app/hooks";
import { manageableCompsPendingSelector } from "../../app/selectors";
import { useFetchCompetitions } from "../../hooks/useFetchCompetitions";

export const CompetitionView = () => {
  useFetchCompetitions();
  const manageableCompsPending = useSelector(manageableCompsPendingSelector);

  if (manageableCompsPending) {
    return <>loading...</>;
  }

  return (
    <Grid container spacing={2}>
      <ChooseCompetition />
      <ConfigureCompetition />
    </Grid>
  );
};
