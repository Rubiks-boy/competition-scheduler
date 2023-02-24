import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  TextField,
  Checkbox,
} from "@mui/material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  enabledOtherActivitiesSelector,
  otherActivitiesSelector,
} from "../../app/selectors";

const activities = [
  "registration",
  "checkin",
  "tutorial",
  "lunch",
  "awards",
] as const;

const ActivityRow = ({
  activity,
  enabled,
  time,
  onTimeChange,
  onToggle,
}: {
  activity: string;
  enabled: boolean;
  time: string;
  onTimeChange: (time: string) => void;
  onToggle: () => void;
}) => {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <Checkbox color="primary" checked={enabled} onChange={onToggle} />
      </TableCell>
      <TableCell component="th" scope="row">
        {activity}
      </TableCell>
      <TableCell align="right">
        <TextField
          hiddenLabel
          size="small"
          type="number"
          disabled={!enabled}
          value={enabled ? time : ""}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </TableCell>
    </TableRow>
  );
};

export const OtherActivities = () => {
  const dispatch = useDispatch();
  const otherActivities = useSelector(otherActivitiesSelector);
  const enabledOtherActivities = useSelector(enabledOtherActivitiesSelector);

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
        }}
      >
        <Typography variant="h6">Other activities</Typography>
      </Toolbar>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Activity</TableCell>
              <TableCell align="right">Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => {
              const enabled = enabledOtherActivities.includes(activity);

              return (
                <ActivityRow
                  activity={activity}
                  enabled={enabled}
                  time={otherActivities[activity]}
                  onToggle={() => {
                    dispatch({
                      type: enabled
                        ? "OTHER_ACTIVITY_DISABLED"
                        : "OTHER_ACTIVITY_ENABLED",
                      activity,
                    });
                  }}
                  onTimeChange={(time) => {
                    dispatch({
                      type: "OTHER_ACTIVITY_TIME_SET",
                      activity,
                      time,
                    });
                  }}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
