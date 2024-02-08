import { useState } from "react";
import { Box, TableCell, TableRow, TextField } from "@mui/material";
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
  numRegisteredByEventSelector,
  numStationsSelector,
} from "../../../app/selectors";

const GroupRow = ({
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
  const numRegisteredByEvent = useSelector(numRegisteredByEventSelector);
  const numRegistered = numRegisteredByEvent[eventId];
  const getGroupName = useSelector(getGroupNameSelector);
  const mainGroupName = getGroupName({ eventId, roundIndex, groupIndex });

  const secondaryGroupName = secondaryEvent
    ? getGroupName({
        eventId: secondaryEvent.eventId,
        roundIndex: secondaryEvent.roundIndex,
        groupIndex: 0,
      })
    : "";

  const calculatedMainTime = calcTimeForRound(eventId, 1);
  const calculatedSecondaryTime = secondaryEvent
    ? calcTimeForRound(secondaryEvent.eventId, 1)
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
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2.4em" }}>
          <span>{mainGroupName}</span>
          {secondaryEvent && <span>{secondaryGroupName}</span>}
        </Box>
      </TableCell>
      <TableCell
        sx={{
          minWidth: "8em",
          width: "20%",
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
      <TableCell sx={{ minWidth: "8em", width: "20%" }}></TableCell>
      <TableCell sx={{ minWidth: "6em", width: "10%" }}>{ratio}</TableCell>
      <TableCell sx={{ minWidth: "10em", width: "20%" }}>
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

export const SimulRoundRow = ({
  round,
  roundIndex,
}: {
  round: Round & { type: "groups" };
  roundIndex: number;
}) => {
  return (
    <>
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
