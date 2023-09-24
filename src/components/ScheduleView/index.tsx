import React, { useState } from "react";
import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { UnfoldMore, UnfoldLess } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import { numberOfDaysSelector, startTimesSelector } from "../../app/selectors";
import { ReorderEvents } from "./ReorderEvents";
import { TimePicker } from "../TimePicker";
import classNames from "classnames";

import "./index.css";

const ScheduleView = () => {
  const dispatch = useDispatch();
  const startTimes = useSelector(startTimesSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);
  const [evenlySpaced, setEvenlySpaced] = useState(true);

  const onStartTimeChange = (startTime: Date) => {
    dispatch({
      type: "START_TIME_CHANGED",
      startTime,
      dayIndex: -1,
    });
  };
  return (
    <div className={classNames({ "schedule--evenlySpaced": evenlySpaced })}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h6">Rearrange events</Typography>
        </Grid>
        {numberOfDays === 1 && (
          <Grid item xs={3}>
            <TimePicker
              label="Start time"
              time={startTimes[0]}
              onChange={onStartTimeChange}
            />
          </Grid>
        )}
        <Grid item xs={1} sx={{ marginLeft: "auto" }}>
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
