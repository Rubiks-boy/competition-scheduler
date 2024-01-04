import React, { useState } from "react";
import {
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Info, Warning } from "@mui/icons-material";
import type { Round } from "../../types";
import { EVENT_NAMES } from "../../constants";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../utils/calculators";
import classNames from "classnames";

const TimeDiffTooltip = ({
  timeDiff,
  calculatedTime,
}: {
  timeDiff: number;
  calculatedTime: number;
}) => {
  return (
    <Tooltip title={`Recommended time: ${calculatedTime}`}>
      {timeDiff >= 20 ? (
        <Warning color="warning" fontSize="small" />
      ) : (
        <Info color="info" fontSize="small" />
      )}
    </Tooltip>
  );
};

export const RoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
}: {
  round: Round;
  roundNum: number;
  isFinal: boolean;
  numStations: number;
  onUpdateRound: (
    field: "numCompetitors" | "numGroups" | "scheduledTime",
    value: string,
    isEditingTime: boolean
  ) => void;
}) => {
  const { eventId, numCompetitors, numGroups, scheduledTime } = round;
  const calculatedTime = calcTimeForRound(eventId, parseInt(numGroups || "0"));
  const timeDiff = Math.abs(calculatedTime - parseInt(scheduledTime));

  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(scheduledTime)
  );

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row" sx={{ minWidth: "10em" }}>
        {EVENT_NAMES[eventId]} {isFinal ? "Final" : `Round ${roundNum + 1}`}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={numCompetitors}
          onChange={(e) =>
            onUpdateRound("numCompetitors", e.target.value, isEditingTime)
          }
        />
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={numGroups}
          onChange={(e) =>
            onUpdateRound("numGroups", e.target.value, isEditingTime)
          }
        />
      </TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%" }}>
        {compPerStationsRatio(round, numStations)}
      </TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
        {isEditingTime ? (
          <div
            className={classNames("events-editScheduledTime", {
              "events-editScheduledTime--timeDiffers":
                scheduledTime && timeDiff >= 5,
            })}
          >
            <TextField
              hiddenLabel
              size="small"
              type="number"
              value={scheduledTime}
              onChange={(e) =>
                onUpdateRound("scheduledTime", e.target.value, isEditingTime)
              }
              InputProps={{ autoFocus: true }}
            />
            <TimeDiffTooltip
              calculatedTime={calculatedTime}
              timeDiff={timeDiff}
            />
          </div>
        ) : (
          <div className="events-scheduledTime">
            <Typography>{scheduledTime}</Typography>
            <IconButton onClick={() => setIsEditingTime(true)}>
              <Tooltip title="Edit scheduled time">
                <Edit color={"action"} fontSize="small" />
              </Tooltip>
            </IconButton>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
