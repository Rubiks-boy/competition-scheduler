import { EventId } from "@wca/helpers";
import { useSelector } from "../../../app/hooks";
import { roundSelector } from "../../../app/selectors";
import { AggregateRoundRow } from "./AggregateRoundRow";
import { SimulRoundRow } from "./SimulRoundRow";

export const RoundRow = ({
  eventId,
  roundIndex,
}: {
  eventId: EventId;
  roundIndex: number;
}) => {
  const round = useSelector((state) =>
    roundSelector(state, { eventId, roundNum: roundIndex })
  );

  if (!round) {
    return null;
  }

  if (round.type === "aggregate") {
    return <AggregateRoundRow round={round} roundIndex={roundIndex} />;
  } else {
    return <SimulRoundRow round={round} roundIndex={roundIndex} />;
  }
};
