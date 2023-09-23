import React from "react";
import { ChooseCompetition } from "./ChooseCompetition";
import { ConfigureCompetition } from "./ConfigureCompetition";
import { Grid, Typography } from "@mui/material";
import { useSelector } from "../../app/hooks";
import { manageableCompsPendingSelector } from "../../app/selectors";

export const CompetitionView = () => {
  const manageableCompsPending = useSelector(manageableCompsPendingSelector);

  if (manageableCompsPending) {
    return <>loading...</>;
  }

  return (
    <>
      <Typography sx={{ mb: 3 }} variant="h6">
        Configure Competition
      </Typography>
      <Grid container spacing={2}>
        <ChooseCompetition />
        <ConfigureCompetition />
      </Grid>
    </>
  );
};
