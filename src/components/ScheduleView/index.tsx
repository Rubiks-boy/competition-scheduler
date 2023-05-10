import React, { useState } from "react";
import {
  Grid,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { UnfoldMore, UnfoldLess } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import { startTimeSelector } from "../../app/selectors";
import { ReorderEvents } from "./ReorderEvents";
import { TimePicker } from "../TimePicker";
import classNames from "classnames";

import "./index.css";

const ScheduleView = () => {
  const dispatch = useDispatch();
  const startTime = useSelector(startTimeSelector);
  const [evenlySpaced, setEvenlySpaced] = useState(true);

  const onStartTimeChange = (startTime: Date) => {
    dispatch({
      type: "START_TIME_CHANGED",
      startTime,
    });
  };
  return (
    <div className={classNames({ "schedule--evenlySpaced": evenlySpaced })}>
      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid item xs={8}>
          <Typography variant="h6">Rearrange events</Typography>
        </Grid>
        <Grid item xs={3}>
          <TimePicker
            label="Start time"
            time={startTime}
            onChange={onStartTimeChange}
          />
        </Grid>
        <Grid item xs={1}>
          <ToggleButtonGroup
            value={evenlySpaced ? [] : ["expand"]}
            onChange={() => setEvenlySpaced(!evenlySpaced)}
          >
            <ToggleButton value="expand">
              {evenlySpaced ? <UnfoldMore /> : <UnfoldLess />}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <ReorderEvents />
    </div>
  );
};

export default ScheduleView;
