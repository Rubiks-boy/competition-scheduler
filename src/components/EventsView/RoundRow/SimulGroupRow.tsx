import { TableCell, TableRow, TextField, Typography } from "@mui/material";
import { getRoundName } from "./helpers";
import type { EventId, SimulGroup } from "../../../types";
import { compPerStationsRatio } from "../../../utils/calculators";
import { SimulRatioTooltip } from "./tooltips";

export const SimulGroupRow = ({
  eventId,
  roundNum,
  simulGroup,
  onUpdate,
  numStations,
}: {
  eventId: EventId;
  roundNum: number;
  simulGroup: SimulGroup;
  onUpdate: (field: "numCompetitors" | "numGroups", value: string) => void;
  numStations: number;
}) => {
  const simulEvent = simulGroup.mainRound.eventId;
  const simulRoundNum = simulGroup.mainRound.roundNum;
  const simulRoundName = getRoundName(
    simulEvent,
    simulRoundNum,
    // TODO: derive isFinal
    false
  );
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
          value={simulGroup.numCompetitors}
          onChange={(e) => onUpdate("numCompetitors", e.target.value)}
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
          numCompetitors={parseInt(simulGroup.mainRound.numCompetitors)}
          roundName={simulRoundName}
        />
      </TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: "none" }}>
        <Typography>{simulGroup.mainRound.scheduledTime}</Typography>
      </TableCell>
    </TableRow>
  );
};
