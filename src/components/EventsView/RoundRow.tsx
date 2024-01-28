import React, { useState } from "react";
import {
  IconButton,
  InputAdornment,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Info, Warning, Error } from "@mui/icons-material";
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
  if (timeDiff === 0) {
    // show a dummy hidden icon
    // this makes sure the up/down arrows on the text field don't jump around.
    return (
      <InputAdornment position="end" sx={{ visibility: "hidden" }}>
        <Info color="info" fontSize="small" />
      </InputAdornment>
    );
  }

  if (timeDiff % 5) {
    return (
      <InputAdornment position="end">
        <Tooltip title="Must be in increments of 5 minutes">
          <Error color="error" fontSize="small" />
        </Tooltip>
      </InputAdornment>
    );
  }

  return (
    <InputAdornment position="end">
      <Tooltip title={`Recommended time: ${calculatedTime}`}>
        {timeDiff >= 20 ? (
          <Warning color="warning" fontSize="small" />
        ) : (
          <Info color="info" fontSize="small" />
        )}
      </Tooltip>
    </InputAdornment>
  );
};

const RegDiffTooltip = ({
  numRegistered,
  regDiffPercent,
}: {
  numRegistered: number;
  regDiffPercent: number;
}) => {
  return (
    <InputAdornment position="end">
      <Tooltip title={`Number of competitors registered: ${numRegistered}`}>
        {regDiffPercent > 0.2 ? (
          <Warning color="warning" fontSize="small" />
        ) : (
          <Info color="info" fontSize="small" />
        )}
      </Tooltip>
    </InputAdornment>
  );
};

export const RoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
  numCompetitorsInt,
  numRegistered,
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
  numCompetitorsInt: number;
  numRegistered: number;
}) => {
  const { eventId, numCompetitors, numGroups, scheduledTime } = round;
  const calculatedTime = calcTimeForRound(eventId, parseInt(numGroups || "0"));
  const timeDiff = Math.abs(calculatedTime - parseInt(scheduledTime));
  const regDiffPercent = Math.abs(
    (numRegistered - numCompetitorsInt) / numRegistered
  );

  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(scheduledTime)
  );

  return (
    <TableRow key={`${eventId}-${roundNum}`}>
      <TableCell component="th" scope="row" sx={{ minWidth: "10em" }}>
        {EVENT_NAMES[eventId]} {isFinal ? "Final" : `Round ${roundNum + 1}`}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <div
          className={classNames("events-fieldWithTooltip", {
            "events-fieldWithTooltip--showTooltip": numRegistered > 0,
          })}
        >
          <TextField
            hiddenLabel
            size="small"
            value={numCompetitors}
            onChange={(e) => {
              const isPercent = roundNum > 0 && e.target.value.endsWith("%");
              const numCompetitors = `${parseInt(e.target.value) || ""}`;
              const value = `${numCompetitors}${isPercent ? "%" : ""}`;
              onUpdateRound("numCompetitors", value, isEditingTime);
            }}
            InputProps={{
              endAdornment: roundNum === 0 && numRegistered > 0 && (
                <RegDiffTooltip
                  regDiffPercent={regDiffPercent}
                  numRegistered={numRegistered}
                />
              ),
            }}
          />
        </div>
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
        {compPerStationsRatio({
          numCompetitors: numCompetitorsInt,
          numGroups: parseInt(numGroups || "0"),
          numStations,
        })}
      </TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
        {isEditingTime ? (
          <TextField
            hiddenLabel
            size="small"
            type="number"
            value={scheduledTime}
            onChange={(e) =>
              onUpdateRound("scheduledTime", e.target.value, isEditingTime)
            }
            inputProps={{ autoFocus: true, step: "5" }}
            InputProps={{
              endAdornment: scheduledTime && (
                <TimeDiffTooltip
                  calculatedTime={calculatedTime}
                  timeDiff={timeDiff}
                />
              ),
            }}
          />
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
