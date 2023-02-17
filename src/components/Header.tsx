import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";

export const Header = () => {
  return (
    <Box sx={{ flexGrow: 1, marginBottom: "1.5em" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Schedule generator
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
