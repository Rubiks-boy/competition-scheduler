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
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { TimeDiffTooltip } from "./tooltips";
import type { RoundRowProps } from "./types";
import { getRoundName } from "./helpers";
import { NumCompetitorsInput } from "./NumCompetitorsInput";

export const NormalRoundRow = ({
  round,
  roundNum,
  isFinal,
  numStations,
  onUpdateRound,
  numCompetitorsInt,
  numRegistered,
}: RoundRowProps) => {
  const {
    eventId,
    totalNumCompetitors: numCompetitors,
    numGroups,
    scheduledTime,
  } = round;
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
        {getRoundName(eventId, roundNum, isFinal)}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%" }}>
        <NumCompetitorsInput
          numCompetitors={numCompetitors}
          roundNum={roundNum}
          onChange={(value) =>
            onUpdateRound("totalNumCompetitors", value, isEditingTime)
          }
          numRegistered={numRegistered}
          regDiffPercent={regDiffPercent}
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
