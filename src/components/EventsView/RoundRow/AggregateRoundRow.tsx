import { useState } from "react";
import { InputAdornment, TableCell, TableRow } from "@mui/material";
import {
  calcExpectedNumCompetitors,
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { NumCompetitorsInput } from "./NumCompetitorsInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import { Round } from "../../../types";
import { useDispatch, useSelector } from "../../../app/hooks";
import {
  numRegisteredByEventSelector,
  numStationsSelector,
  getRoundNameSelector,
  groupIndexSelector,
  getSimulGroupsForEventSelector,
  numCompetitorsInRoundSelector,
  competitorLimitSelector,
  totalNumCompetitorsSelector,
} from "../../../app/selectors";
import { Error } from "@mui/icons-material";
import { NumberTextField } from "../../NumberTextField";

type Props = {
  round: Round & { type: "aggregate" };
  roundIndex: number;
};

export const AggregateRoundRow = ({ round, roundIndex }: Props) => {
  const dispatch = useDispatch();

  const { eventId, totalNumCompetitors, numGroups, scheduledTime } = round;
  const numCompetitorsInt = useSelector(numCompetitorsInRoundSelector)({
    eventId,
    roundNum: roundIndex,
  });

  const getRoundName = useSelector(getRoundNameSelector);
  const hasOtherSimulGroups = !!useSelector(getSimulGroupsForEventSelector)({
    eventId,
    roundIndex,
  }).length;
  const roundName = getRoundName({ eventId, roundIndex });
  const startingGroupIndex =
    useSelector((state) =>
      groupIndexSelector(state, {
        eventId,
        roundIndex,
      })
    ) ?? 0;
  let groupString = "";
  if (parseInt(numGroups) > 1) {
    groupString = ` Groups ${startingGroupIndex + 1}-${
      startingGroupIndex + parseInt(numGroups)
    }`;
  } else if (parseInt(numGroups) === 1) {
    groupString = ` Group ${startingGroupIndex + 1}`;
  }

  const numStations = useSelector(numStationsSelector);
  const numRegisteredByEvent = useSelector(numRegisteredByEventSelector);
  const numRegistered = numRegisteredByEvent[eventId];

  const calculatedTime = calcTimeForRound(eventId, parseInt(numGroups));
  const regDiffPercent = Math.abs(
    (numRegistered - numCompetitorsInt) / numRegistered
  );

  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(scheduledTime)
  );

  const ratio = compPerStationsRatio({
    numCompetitors: numCompetitorsInt,
    numGroups: parseInt(numGroups || "0"),
    numStations,
  });

  const competitorLimit = useSelector(competitorLimitSelector);
  const estimatedCompetitors = calcExpectedNumCompetitors(
    eventId,
    competitorLimit
  );

  const totalInRoundWithSimul = useSelector(totalNumCompetitorsSelector)({
    eventId,
    roundIndex,
  });

  const onUpdateRound = (
    field: "totalNumCompetitors" | "numGroups" | "scheduledTime",
    value: string
  ) => {
    dispatch({
      type: "ROUND_UPDATED",
      eventId,
      roundNum: roundIndex,
      isEditingTime,
      [field]: value,
    });
  };

  return (
    <TableRow key={`${eventId}-${roundIndex}`}>
      <TableCell
        component="th"
        scope="row"
        sx={{ borderBottom: 0, minWidth: "10em" }}
      >
        {roundName}
        {hasOtherSimulGroups && groupString}
      </TableCell>
      <TableCell sx={{ borderBottom: 0, minWidth: "8em", width: "20%" }}>
        <NumCompetitorsInput
          numCompetitors={totalNumCompetitors}
          roundIndex={roundIndex}
          onChange={(value) => onUpdateRound("totalNumCompetitors", value)}
          numRegistered={numRegistered}
          regDiffPercent={regDiffPercent}
          estimatedCompetitors={estimatedCompetitors}
          totalInRoundWithSimul={totalInRoundWithSimul}
          disabled={
            !parseInt(numGroups) &&
            !!(totalInRoundWithSimul - parseInt(totalNumCompetitors))
          }
        />
      </TableCell>
      <TableCell sx={{ borderBottom: 0, minWidth: "8em", width: "20%" }}>
        <NumberTextField
          hiddenLabel
          size="small"
          value={numGroups}
          onChange={(e) => onUpdateRound("numGroups", e.target.value)}
          InputProps={{
            endAdornment: !parseInt(numGroups) &&
              !(totalInRoundWithSimul - parseInt(totalNumCompetitors)) && (
                <InputAdornment position="end">
                  <Error color="error" fontSize="small" />
                </InputAdornment>
              ),
          }}
        />
      </TableCell>
      <TableCell sx={{ borderBottom: 0, minWidth: "6em", width: "10%" }}>
        {ratio}
      </TableCell>
      <TableCell sx={{ borderBottom: 0, minWidth: "10em", width: "20%" }}>
        <ScheduledTimeInput
          isEditingTime={isEditingTime}
          setEditingTime={() => setIsEditingTime(true)}
          scheduledTime={scheduledTime}
          calculatedTime={calculatedTime}
          onChange={(value) => onUpdateRound("scheduledTime", value)}
        />
      </TableCell>
    </TableRow>
  );
};
