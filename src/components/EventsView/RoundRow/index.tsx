import { NormalRoundRow } from "./NormalRoundRow";
// import { SimulRoundRow } from "./SimulRoundRow";
import { RoundRowProps } from "./types";

export const RoundRow = (props: RoundRowProps) => {
  if (props.round.simulGroups.length) {
    return <>simul</>;
    // return <SimulRoundRow {...props} />;
  }

  return <NormalRoundRow {...props} />;
};
