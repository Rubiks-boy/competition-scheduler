import { useState } from "react";
import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { UnfoldMore, UnfoldLess } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import { numberOfDaysSelector, startTimesSelector } from "../../app/selectors";
import { ReorderEvents } from "./ReorderEvents";
import { TimePicker } from "../TimePicker";
import classNames from "classnames";

import "./index.css";
import { ResetScheduleButtons } from "../EventsView/ResetScheduleButtons";

const ScheduleView = () => {
  const dispatch = useDispatch();
  const startTimes = useSelector(startTimesSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);
  const [evenlySpaced, setEvenlySpaced] = useState(false);

  const onStartTimeChange = (startTime: Date) => {
    dispatch({
      type: "START_TIME_CHANGED",
      startTime,
      dayIndex: -1,
    });
  };
  return (
    <div className={classNames({ "schedule--evenlySpaced": evenlySpaced })}>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid item>
          <Typography variant="h6">Rearrange events</Typography>
        </Grid>
        <Grid item sx={{ display: "flex", gap: "1em" }}>
          <ResetScheduleButtons />
          {numberOfDays === 1 && (
            <TimePicker
              sx={{ width: "auto" }}
              label="Start time"
              time={startTimes[0]}
              onChange={onStartTimeChange}
            />
          )}
          <ToggleButtonGroup
            value={evenlySpaced ? [] : ["expand"]}
            onChange={() => setEvenlySpaced(!evenlySpaced)}
          >
            <ToggleButton value="expand">
              {evenlySpaced ? (
                <Tooltip title="Switch to expanded view">
                  <UnfoldMore />
                </Tooltip>
              ) : (
                <Tooltip title="Make events evenly spaced">
                  <UnfoldLess />
                </Tooltip>
              )}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <ReorderEvents />
    </div>
  );
};

export default ScheduleView;
