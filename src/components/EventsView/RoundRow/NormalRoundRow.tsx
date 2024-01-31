import { useState } from "react";
import {
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { EVENT_NAMES } from "../../../constants";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import classNames from "classnames";
import { RegDiffTooltip, TimeDiffTooltip } from "./tooltips";
import type { RoundRowProps } from "./types";

export const NormalRoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
  numCompetitorsInt,
  numRegistered,
}: RoundRowProps) => {
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
