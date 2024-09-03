import { Box, IconButton, TableCell, TableRow } from "@mui/material";
import type { Round } from "../../../types";
import { useDispatch, useSelector } from "../../../app/hooks";
import {
  competitorLimitSelector,
  getNumGroupsSelector,
  getRoundNameSelector,
  getScheduledTimeSelector,
  totalNumCompetitorsSelector,
  numRegisteredByEventSelector,
} from "../../../app/selectors";
import { calcExpectedNumCompetitors } from "../../../utils/calculators";
import { PredictedRegDiffTooltip, RegDiffTooltip } from "./tooltips";
import { AddCircle, Clear } from "@mui/icons-material";

export const TotalRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  const dispatch = useDispatch();

  const { eventId } = round;
  const roundName = useSelector(getRoundNameSelector)({ eventId, roundIndex });
  const numCompetitors = useSelector(totalNumCompetitorsSelector)({
    eventId,
    roundIndex,
  });
  const numGroups = useSelector(getNumGroupsSelector)({ eventId, roundIndex });
  const scheduledTime = useSelector(getScheduledTimeSelector)({
    eventId,
    roundIndex,
  });
  const competitorLimit = useSelector(competitorLimitSelector);

  const numRegistered = useSelector(numRegisteredByEventSelector)[
    round.eventId
  ];
  const regDiffPercent = (numRegistered - numCompetitors) / numRegistered;

  const estimatedCompetitors = calcExpectedNumCompetitors(
    round.eventId,
    competitorLimit
  );
  const predictedDiffPerc = Math.abs(
    (estimatedCompetitors - numCompetitors) / estimatedCompetitors
  );

  const onAddGroup = () => {
    dispatch({ type: "ADD_GROUP", eventId, roundNum: roundIndex });
  };
  const onRemoveGroup = () => {
    dispatch({ type: "REMOVE_GROUP", eventId, roundNum: roundIndex });
  };

  let tooltip = null;
  if (roundIndex === 0) {
    if (numRegistered) {
      tooltip = (
        <RegDiffTooltip
          regDiffPercent={regDiffPercent}
          numRegistered={numRegistered}
        />
      );
    } else {
      tooltip = (
        <PredictedRegDiffTooltip
          numPredicted={estimatedCompetitors}
          diffPercent={predictedDiffPerc}
        />
      );
    }
  }

  return (
    <TableRow key={`${eventId}-${roundIndex}`}>
      <TableCell
        component="th"
        scope="row"
        sx={{
          minWidth: "10em",
          borderBottom: 0,
        }}
      >
        {roundName}
      </TableCell>
      <TableCell
        sx={{
          minWidth: "8em",
          width: "20%",
          borderBottom: 0,
        }}
      >
        <Box sx={{ display: "flex", gap: "0.5em" }}>
          {numCompetitors}
          {tooltip}
        </Box>
      </TableCell>
      <TableCell
        sx={{
          minWidth: "8em",
          width: "20%",
          borderBottom: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ pr: "1em" }}>{numGroups}</Box>
        <IconButton size="small" onClick={onAddGroup}>
          <AddCircle fontSize="small" color="info" />
        </IconButton>
        <IconButton size="small" onClick={onRemoveGroup}>
          <Clear fontSize="small" color="error" />
        </IconButton>
      </TableCell>
      <TableCell
        sx={{ minWidth: "6em", width: "10%", borderBottom: 0 }}
      ></TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: 0 }}>
        {scheduledTime}
      </TableCell>
    </TableRow>
  );
};
