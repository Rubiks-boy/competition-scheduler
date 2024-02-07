import {
  Paper,
  TableContainer,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import { AddCircle, Close } from "@mui/icons-material";
import { EVENT_NAMES } from "../../constants";
import { EventId } from "@wca/helpers";
import { Round } from "../../types";
import { RoundRow } from "./RoundRow";
import { calcNumCompetitorsPerRound } from "../../utils/utils";
import { UpdatableRoundField, UpdatableSimulField } from "./RoundRow/types";
import { EventTable } from "./EventTable";

type EventProps = {
  eventId: EventId;
  rounds: Array<Round>;
  numStations: number;
  numRegistered: number;
  makeOnUpdateRound: (
    eventId: EventId,
    roundIndex: number
  ) => (
    field: UpdatableRoundField,
    value: string,
    isEditingTime: boolean
  ) => void;
  makeOnUpdateSimulRound: (
    eventId: EventId,
    roundIndex: number,
    groupIndex: number
  ) => (field: UpdatableSimulField, value: string) => void;
  onAddRound: () => void;
  onRemoveRound: () => void;
};

export const Event = ({
  eventId,
  rounds,
  numStations,
  numRegistered,
  makeOnUpdateRound,
  makeOnUpdateSimulRound,
  onAddRound,
  onRemoveRound,
}: EventProps) => {
  const eventName = EVENT_NAMES[eventId];
  const numCompetitorsPerRound = calcNumCompetitorsPerRound(rounds);
  const roundRows = rounds.map((round, roundNum) => (
    <RoundRow
      key={`${round.eventId}-${roundNum}`}
      round={round}
      roundNum={roundNum}
      isFinal={roundNum === rounds.length - 1}
      numStations={numStations}
      onUpdateRound={makeOnUpdateRound(round.eventId, roundNum)}
      makeOnUpdateSimulRound={makeOnUpdateSimulRound}
      numCompetitorsInt={numCompetitorsPerRound[roundNum]}
      numRegistered={numRegistered}
    />
  ));

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">{eventName}</Typography>
        <div className="event-add-remove-btns">
          <IconButton onClick={onAddRound} disabled={rounds.length >= 4}>
            <Tooltip title="Add round">
              <AddCircle
                color={rounds.length < 4 ? "primary" : "disabled"}
                fontSize="medium"
              />
            </Tooltip>
          </IconButton>
          <IconButton onClick={onRemoveRound} disabled={!rounds.length}>
            <Tooltip title="Remove round">
              <Close
                color={rounds.length ? "error" : "disabled"}
                fontSize="small"
              />
            </Tooltip>
          </IconButton>
        </div>
      </Toolbar>
      {rounds.length > 0 && (
        <TableContainer>
          <EventTable>{roundRows}</EventTable>
        </TableContainer>
      )}
    </Paper>
  );
};
