import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { SignIn } from "./SignIn";
import {
  activeStepSelector,
  competitionNameSelector,
} from "../../app/selectors";
import { useSelector } from "../../app/hooks";

export const Header = () => {
  const competitionName = useSelector(competitionNameSelector);
  const activeStep = useSelector(activeStepSelector);

  return (
    <Box sx={{ flexGrow: 1, marginBottom: "1.5em" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h1"
            component="div"
            sx={{ flexGrow: 1, fontSize: "1.5rem", fontWeight: "500" }}
          >
            {activeStep === 0
              ? "Schedule generator"
              : `Schedule generator – ${competitionName}`}
          </Typography>
          <SignIn />
        </Toolbar>
      </AppBar>
    </Box>
  );
};
