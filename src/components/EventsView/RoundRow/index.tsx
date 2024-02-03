import { useSelector } from "../../../app/hooks";
import { inverseSimulGroupsSelector } from "../../../app/selectors";
import { NormalRoundRow } from "./NormalRoundRow";
import { SimulRoundRow } from "./SimulRoundRow";
import { RoundRowProps } from "./types";

export const RoundRow = (props: RoundRowProps) => {
  const inverseSimulGroups = useSelector(
    inverseSimulGroupsSelector(props.round.eventId, props.roundNum)
  );

  if (props.round.simulGroups.length || inverseSimulGroups.length) {
    return <SimulRoundRow {...props} inverseSimulGroups={inverseSimulGroups} />;
  }

  return <NormalRoundRow {...props} />;
};
