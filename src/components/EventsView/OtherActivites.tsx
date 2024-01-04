import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Error } from "@mui/icons-material";
import { useDispatch, useSelector } from "../../app/hooks";
import {
  enabledOtherActivitiesSelector,
  otherActivitiesSelector,
  numOtherActivitiesSelector,
  numberOfDaysSelector,
} from "../../app/selectors";
import { ACTIVITIES, ACTIVITY_NAMES } from "../../constants";
import classNames from "classnames";

type Activity = (typeof ACTIVITIES)[number];

const ActivityRow = ({
  activity,
  enabled,
  time,
  numOfActivity,
  onTimeChange,
  onToggle,
  shouldDisplayOccurrenes,
  onOccurrencesChange,
}: {
  activity: Activity;
  enabled: boolean;
  time: string;
  numOfActivity: string;
  onTimeChange: (time: string) => void;
  onToggle: () => void;
  shouldDisplayOccurrenes: boolean;
  onOccurrencesChange: (occurrences: string) => void;
}) => {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <Checkbox color="primary" checked={enabled} onChange={onToggle} />
      </TableCell>
      <TableCell component="th" scope="row">
        {ACTIVITY_NAMES[activity]}
      </TableCell>
      {shouldDisplayOccurrenes && (
        <TableCell sx={{ width: "30%" }}>
          <TextField
            hiddenLabel
            size="small"
            type="number"
            disabled={!enabled}
            value={enabled ? numOfActivity : ""}
            onChange={(e) => onOccurrencesChange(e.target.value)}
          />
        </TableCell>
      )}
      <TableCell sx={{ width: "30%" }}>
        <div
          className={classNames("events-editScheduledTime", {
            "events-editScheduledTime--showTooltip":
              enabled && parseInt(time) % 5,
          })}
        >
          <TextField
            hiddenLabel
            size="small"
            type="number"
            disabled={!enabled}
            value={enabled ? time : ""}
            onChange={(e) => onTimeChange(e.target.value)}
            inputProps={{ autoFocus: true, step: "5" }}
            fullWidth
          />
          <Tooltip title="Must be in increments of 5 minutes">
            <Error color="error" fontSize="small" />
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const OtherActivities = () => {
  const dispatch = useDispatch();
  const otherActivities = useSelector(otherActivitiesSelector);
  const numOtherActivities = useSelector(numOtherActivitiesSelector);
  const enabledOtherActivities = useSelector(enabledOtherActivitiesSelector);
  const numberOfDays = useSelector(numberOfDaysSelector);

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Other activities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Activity</TableCell>
                  {numberOfDays > 1 && <TableCell>Occurrences</TableCell>}
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ACTIVITIES.map((activity) => {
                  const enabled = enabledOtherActivities.includes(activity);

                  return (
                    <ActivityRow
                      key={activity}
                      activity={activity}
                      enabled={enabled}
                      time={otherActivities[activity]}
                      numOfActivity={numOtherActivities[activity]}
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
                      shouldDisplayOccurrenes={numberOfDays > 1}
                      onOccurrencesChange={(numberOfActivity) => {
                        dispatch({
                          type: "OTHER_ACTIVITY_NUMBER_CHANGED",
                          activity,
                          numberOfActivity,
                        });
                      }}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
