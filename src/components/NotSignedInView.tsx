import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { signIn } from "../utils/auth";
import { KeyboardDoubleArrowRight } from "@mui/icons-material";

export const SignIn = () => {
  return (
    <Button
      onClick={() => signIn()}
      color="inherit"
      endIcon={<KeyboardDoubleArrowRight />}
      sx={{ width: "fit-content" }}
    >
      Sign in with WCA
    </Button>
  );
};

export const NotSignedInView = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        justifyContent: "left",
      }}
    >
      <Typography variant="h5">Welcome!</Typography>
      <Typography variant="body1">
        This tool requires access to your upcoming WCA competitions in order to
        create, modify, and export new schedules. Grant access through the WCA
        website to continue.
      </Typography>
      <SignIn />
    </Box>
  );
};
