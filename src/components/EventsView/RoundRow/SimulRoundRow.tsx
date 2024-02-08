import { useState } from "react";
import { Box, TableCell, TableRow } from "@mui/material";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { NumCompetitorsInput } from "./NumCompetitorsInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import { EventId, Round, SimulGroup } from "../../../types";
import { useDispatch, useSelector } from "../../../app/hooks";
import {
  getGroupNameSelector,
  getNumGroupsSelector,
  getRoundNameSelector,
  getScheduledTimeSelector,
  numStationsSelector,
  totalNumCompetitorsSelector,
} from "../../../app/selectors";

export const GroupRow = ({
  group,
  eventId,
  roundIndex,
  groupIndex,
}: {
  group: SimulGroup;
  eventId: EventId;
  roundIndex: number;
  groupIndex: number;
}) => {
  const dispatch = useDispatch();

  const { secondaryEvent, numMainCompetitors, scheduledTime } = group;

  const numStations = useSelector(numStationsSelector);
  const getGroupName = useSelector(getGroupNameSelector);
  const mainGroupName = getGroupName({
    eventId,
    roundIndex,
    groupIndex,
    showRoundName: !!secondaryEvent,
  });

  const secondaryGroupName = secondaryEvent
    ? getGroupName({
        eventId: secondaryEvent.eventId,
        roundIndex: secondaryEvent.roundIndex,
        secondaryEventUnder: {
          eventId,
          roundIndex,
          groupIndex,
        },
      })
    : "";

  const calculatedMainTime = calcTimeForRound(eventId, 1, false);
  const calculatedSecondaryTime = secondaryEvent
    ? calcTimeForRound(secondaryEvent.eventId, 1, false)
    : 0;
  const calculatedTime = Math.max(calculatedMainTime, calculatedSecondaryTime);

  const numCompetitorsInGroup =
    parseInt(numMainCompetitors) +
    (secondaryEvent ? parseInt(secondaryEvent.numCompetitors) : 0);

  const [isEditingTime, setIsEditingTime] = useState(
    calculatedTime !== parseInt(scheduledTime)
  );

  const ratio = compPerStationsRatio({
    numCompetitors: numCompetitorsInGroup,
    numGroups: 1,
    numStations,
  });

  const onUpdateRound = (
    field: "numMainCompetitors" | "numSecondaryCompetitors" | "scheduledTime",
    value: string
  ) => {
    dispatch({
      type: "UPDATE_SIMUL_GROUP",
      eventId,
      roundIndex,
      groupIndex,
      [field]: value,
    });
  };

  return (
    <TableRow key={`${eventId}-${roundIndex}`}>
      <TableCell
        component="th"
        scope="row"
        sx={{
          minWidth: "10em",
          borderBottom: 0,
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            lineHeight: "40px",
            gap: "1em",
            pl: secondaryEvent ? "3em" : "2em",
          }}
        >
          {secondaryEvent && (
            <Box
              sx={{
                position: "absolute",
                width: "0.5em",
                height: "55px",
                border: "1px solid",
                borderRight: 0,
                left: "2em",
                top: "20px",
              }}
            ></Box>
          )}
          <span>{mainGroupName}</span>
          {secondaryEvent && <span>{secondaryGroupName}</span>}
        </Box>
      </TableCell>
      <TableCell
        sx={{
          minWidth: "8em",
          width: "20%",
          borderBottom: 0,
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          <NumCompetitorsInput
            numCompetitors={numMainCompetitors}
            roundIndex={roundIndex}
            onChange={(value) => onUpdateRound("numMainCompetitors", value)}
          />
          {secondaryEvent && (
            <NumCompetitorsInput
              numCompetitors={secondaryEvent.numCompetitors}
              roundIndex={roundIndex}
              onChange={(value) =>
                onUpdateRound("numSecondaryCompetitors", value)
              }
            />
          )}
        </Box>
      </TableCell>
      <TableCell
        sx={{ minWidth: "8em", width: "20%", borderBottom: 0, pb: 1 }}
      ></TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%", borderBottom: 0, pb: 1 }}>
        {ratio}
      </TableCell>
      <TableCell
        sx={{ minWidth: "10em", width: "20%", borderBottom: 0, pb: 1 }}
      >
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

export const TotalRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
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
        {numCompetitors}
      </TableCell>
      <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: 0 }}>
        {numGroups}
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

export const SimulRoundRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  return (
    <>
      <TotalRow round={round} roundIndex={roundIndex} />
      {round.groups.map((group, groupIndex) => (
        <GroupRow
          group={group}
          eventId={round.eventId}
          roundIndex={roundIndex}
          groupIndex={groupIndex}
        />
      ))}
    </>
  );
};
