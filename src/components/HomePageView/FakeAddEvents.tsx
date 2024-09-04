import React, { useState, useEffect } from "react";
import { IconButton, Typography } from "@mui/material";
import { AddCircle, Clear } from "@mui/icons-material";
import cn from "classnames";

export const FakeAddEvents = () => {
  const [numEvents, setNumEvents] = useState(-1);

  useEffect(() => {
    const int = setInterval(() => {
      setNumEvents((n) => n + 1);
    }, 1000);

    return () => {
      clearInterval(int);
    };
  }, []);

  return (
    <div className="FakeAddEvents">
      <Typography variant="h6">Add events</Typography>
      <div
        className={cn("FakeAddEvents-event", {
          "FakeAddEvents-event--clicked": numEvents >= 1,
        })}
      >
        <span>3x3</span>
        <IconButton color="primary">
          <AddCircle />
        </IconButton>
        <IconButton color="error">
          <Clear />
        </IconButton>
      </div>
      <div
        className={cn("FakeAddEvents-event", {
          "FakeAddEvents-event--clicked": numEvents >= 2,
        })}
      >
        <span>2x2</span>
        <IconButton color="primary">
          <AddCircle />
        </IconButton>
        <IconButton color="error">
          <Clear />
        </IconButton>
      </div>
      <div
        className={cn("FakeAddEvents-event", {
          "FakeAddEvents-event--clicked": numEvents >= 3,
        })}
      >
        <span>4x4</span>
        <IconButton color="primary">
          <AddCircle />
        </IconButton>
        <IconButton color="error">
          <Clear />
        </IconButton>
      </div>
      <div
        className={cn("FakeAddEvents-event", {
          "FakeAddEvents-event--clicked": numEvents >= 4,
        })}
      >
        <span>3x3 OH</span>
        <IconButton color="primary">
          <AddCircle />
        </IconButton>
        <IconButton color="error">
          <Clear />
        </IconButton>
      </div>
    </div>
  );
};
