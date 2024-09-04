import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { signIn } from "../../utils/auth";
import { KeyboardDoubleArrowRight } from "@mui/icons-material";
import { Preview } from "./Preview";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  isSignedInSelector,
  selectedCompIdSelector,
} from "../../app/selectors";
import { ChooseCompetition } from "../CompetitionView/ChooseCompetition";

import "./HomePageView.css";

export const SignIn = () => {
  return (
    <div className="SignIn">
      <Button
        onClick={() => signIn()}
        color="primary"
        variant="outlined"
        endIcon={<KeyboardDoubleArrowRight />}
        sx={{ width: "fit-content" }}
      >
        Sign in with WCA
      </Button>
    </div>
  );
};

export const ChooseCompetitionView = () => {
  const isFetched = !!useSelector(selectedCompIdSelector);
  const dispatch = useDispatch();

  return (
    <div
      className="ChooseCompetitionView"
      style={{ visibility: isFetched ? "visible" : "hidden" }}
    >
      <ChooseCompetition />
      <Button
        onClick={() => {
          dispatch({ type: "LEAVE_HOMEPAGE" });
        }}
        color="primary"
        variant="outlined"
        endIcon={<KeyboardDoubleArrowRight />}
        sx={{ width: "max-content" }}
      >
        Create schedule
      </Button>
    </div>
  );
};

export const HomePageView = () => {
  const isSignedIn = useSelector(isSignedInSelector);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    // Debounce time to allow signing in / parsing app state to do it's thing
    setTimeout(() => {
      setShowActions(true);
    }, 150);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        justifyContent: "left",
      }}
    >
      <Typography variant="h5">WCA Competition Scheduler</Typography>
      <Typography variant="subtitle1">
        Easily create and modify schedules for your WCA competition.
      </Typography>
      {showActions && (
        <>
          {isSignedIn ? <ChooseCompetitionView /> : <SignIn />}
          <Preview />
          <Typography variant="body2">
            This tool requires access to your upcoming WCA competitions in order
            to create, modify, and export new schedules. Grant access through
            the World Cube Association website to continue.
          </Typography>
        </>
      )}
    </Box>
  );
};
