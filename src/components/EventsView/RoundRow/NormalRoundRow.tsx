import { useState } from "react";
import { TableCell, TableRow, TextField } from "@mui/material";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { getRoundName } from "./helpers";
import { NumCompetitorsInput } from "./NumCompetitorsInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
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
  const {
    eventId,
    totalNumCompetitors: numCompetitors,
    numGroups,
    scheduledTime,
  } = round;
  const calculatedTime = calcTimeForRound(eventId, parseInt(numGroups || "0"));
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
        <ScheduledTimeInput
          isEditingTime={isEditingTime}
          setEditingTime={() => setIsEditingTime(true)}
          round={round}
          onChange={(value) =>
            onUpdateRound("scheduledTime", value, isEditingTime)
          }
        />
      </TableCell>
    </TableRow>
  );
};
