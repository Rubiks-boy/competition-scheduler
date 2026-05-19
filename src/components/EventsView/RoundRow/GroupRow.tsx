import { useState } from "react";
import { Box, IconButton, TableCell, TableRow } from "@mui/material";
import {
  calcTimeForRound,
  compPerStationsRatio,
} from "../../../utils/calculators";
import { NumCompetitorsInput } from "./NumCompetitorsInput";
import { ScheduledTimeInput } from "./ScheduledTimeInput";
import { EventId, SimulGroup } from "../../../types";
import { useDispatch, useSelector } from "../../../app/hooks";
import {
  getGroupNameSelector,
  numStationsSelector,
  speedSeletor,
  isStationaryCompetitionSelector,
} from "../../../app/selectors";
import { Close } from "@mui/icons-material";

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

  const speedOffset = useSelector(speedSeletor);
  const isStationaryCompetition = useSelector(isStationaryCompetitionSelector);
  const numStations = useSelector(numStationsSelector);
  const getGroupName = useSelector(getGroupNameSelector);
  const mainGroupName = getGroupName({
    eventId,
    roundIndex,
    groupIndex,
    roundNames: secondaryEvent ? "short" : "none",
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
        roundNames: "short",
      })
    : "";

  const calculatedMainTime = calcTimeForRound(
    eventId,
    1,
    false,
    speedOffset,
    isStationaryCompetition
  );
  const calculatedSecondaryTime = secondaryEvent
    ? calcTimeForRound(
        secondaryEvent.eventId,
        1,
        false,
        speedOffset,
        isStationaryCompetition
      )
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

  const onRemoveSimulGroup = () => {
    dispatch({
      type: "DELETE_SIMUL_GROUP",
      eventId,
      roundIndex,
      groupIndex,
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {mainGroupName}
          </Box>
          {secondaryEvent && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {secondaryGroupName}
              <IconButton size="small" onClick={onRemoveSimulGroup}>
                <Close color="error" fontSize="small" />
              </IconButton>
            </Box>
          )}
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
