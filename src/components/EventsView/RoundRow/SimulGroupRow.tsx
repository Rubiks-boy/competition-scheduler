import { TableCell, TableRow, TextField } from "@mui/material";
import { getRoundName } from "./helpers";
import type { EventId, SimulGroup } from "../../../types";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { SimulRatioTooltip } from "./tooltips";
import { useState } from "react";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import type { UpdatableSimulField } from "./types";

export const SimulGroupRow = ({
  eventId,
  roundNum,
  simulGroup,
  onUpdate,
  numStations,
  isInverseSimulGroup = false,
}: {
  eventId: EventId;
  roundNum: number;
  simulGroup: SimulGroup;
  onUpdate: (field: UpdatableSimulField, value: string) => void;
  numStations: number;
  isInverseSimulGroup?: boolean;
}) => {
  const {
    eventId: simulEvent,
    numGroups: simulGroups,
    roundNum: simulRoundNum,
    scheduledTime,
  } = simulGroup.mainRound;

  const calculatedTime = calcTimeForRound(
    simulEvent,
    parseInt(simulGroups || "0")
  );
  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(scheduledTime)
  );

  let simulRoundName: string;
  if (isInverseSimulGroup) {
    simulRoundName = getRoundName(
      eventId,
      roundNum,
      // TODO: derive isFinal
      false
    );
  } else {
    simulRoundName = getRoundName(
      simulEvent,
      simulRoundNum,
      // TODO: derive isFinal
      false
    );
  }
  const ratio = compPerStationsRatio({
    numCompetitors:
      parseInt(simulGroup.numCompetitors) +
      parseInt(simulGroup.mainRound.numCompetitors),
    numGroups: parseInt(simulGroup.mainRound.numGroups),
    numStations,
  });

  return (
    <TableRow
      key={`${eventId}-${roundNum}-simul-${simulEvent}-${simulRoundNum}`}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ minWidth: "10em", pl: 4, borderBottom: "none" }}
      >
        Alongside {simulRoundName}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
        <TextField
          hiddenLabel
          size="small"
          value={
            isInverseSimulGroup
              ? simulGroup.mainRound.numCompetitors
              : simulGroup.numCompetitors
          }
          onChange={(e) =>
            onUpdate(
              isInverseSimulGroup ? "numMainCompetitors" : "numCompetitors",
              e.target.value
            )
          }
        />
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
        <TextField
          hiddenLabel
          size="small"
          type="number"
          value={simulGroup.mainRound.numGroups}
          onChange={(e) => onUpdate("numGroups", e.target.value)}
        />
      </TableCell>
      <TableCell
        sx={{
          minWidth: "6em",
          width: "10%",
          borderBottom: "none",
          position: "relative",
        }}
      >
        {ratio}
        <SimulRatioTooltip
          numCompetitors={parseInt(
            isInverseSimulGroup
              ? simulGroup.numCompetitors
              : simulGroup.mainRound.numCompetitors
          )}
          roundName={simulRoundName}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: "none" }}>
        <ScheduledTimeInput
          isEditingTime={isEditingTime}
          setEditingTime={() => setIsEditingTime(true)}
          round={simulGroup.mainRound}
          onChange={(value) => onUpdate("scheduledTime", value)}
        />
      </TableCell>
    </TableRow>
  );
};
