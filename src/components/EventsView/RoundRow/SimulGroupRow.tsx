// import { TableCell, TableRow, TextField } from "@mui/material";
// import { getRoundName } from "./helpers";
import type { EventId, SimulGroup } from "../../../types";
// import {
//   calcTimeForRound,
//   compPerStationsRatio,
// } from "../../../utils/calculators";
// import { SimulRatioTooltip } from "./tooltips";
// import { useState } from "react";
// import { ScheduledTimeInput } from "./ScheduledTimeInput";
import type { UpdatableSimulField } from "./types";
// import { useSelector } from "../../../app/hooks";
// import { groupNumSelector } from "../../../app/selectors";

export const SimulGroupRow = ({
  eventId,
  roundNum,
  simulGroup,
  onUpdate,
  numStations,
  isInverseSimulGroup = false,
}: {
  eventId: EventId;
  roundNum: number;
  simulGroup: SimulGroup;
  onUpdate: (field: UpdatableSimulField, value: string) => void;
  numStations: number;
  isInverseSimulGroup?: boolean;
}) => {
  return null;

  // const {
  //   eventId: simulEvent,
  //   roundNum: simulRoundNum,
  //   scheduledTime,
  // } = simulGroup.mainRound;

  // const calculatedTime = calcTimeForRound(simulEvent, 1);
  // const [isEditingTime, setIsEditingTime] = useState(
  //   calculatedTime !== parseInt(scheduledTime)
  // );
  // const inverseGroupNum = useSelector(
  //   groupNumSelector({
  //     scheduleEntry: {
  //       eventId: simulGroup.mainRound.eventId,
  //       roundNum: simulGroup.mainRound.roundNum,
  //     },
  //     simulGroup: {
  //       eventId,
  //       roundNum,
  //       groupOffset: simulGroup.groupOffset,
  //     },
  //   })
  // );

  // let simulRoundName: string;
  // let simulGroupName: string;
  // if (isInverseSimulGroup) {
  //   simulRoundName = getRoundName(
  //     eventId,
  //     roundNum,
  //     // TODO: derive isFinal
  //     false
  //   );
  //   simulGroupName = `Group ${simulGroup.groupOffset + 1}`;
  // } else {
  //   simulRoundName = getRoundName(
  //     simulEvent,
  //     simulRoundNum,
  //     // TODO: derive isFinal
  //     false
  //   );
  //   simulGroupName = `Group ${inverseGroupNum}`;
  // }

  // const ratio = compPerStationsRatio({
  //   numCompetitors:
  //     parseInt(simulGroup.numCompetitors) +
  //     parseInt(simulGroup.mainRound.numCompetitors),
  //   numGroups: 1,
  //   numStations,
  // });

  // return (
  //   <TableRow
  //     key={`${eventId}-${roundNum}-simul-${simulEvent}-${simulRoundNum}`}
  //   >
  //     <TableCell
  //       component="th"
  //       scope="row"
  //       sx={{ minWidth: "10em", pl: 4, borderBottom: "none" }}
  //     >
  //       Alongside {simulRoundName} {simulGroupName}
  //     </TableCell>
  //     <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
  //       <TextField
  //         hiddenLabel
  //         size="small"
  //         value={
  //           isInverseSimulGroup
  //             ? simulGroup.mainRound.numCompetitors
  //             : simulGroup.numCompetitors
  //         }
  //         onChange={(e) =>
  //           onUpdate(
  //             isInverseSimulGroup ? "numMainCompetitors" : "numCompetitors",
  //             e.target.value
  //           )
  //         }
  //       />
  //     </TableCell>
  //     <TableCell sx={{ minWidth: "8em", width: "20%", borderBottom: "none" }}>
  //       {1}
  //     </TableCell>
  //     <TableCell
  //       sx={{
  //         minWidth: "6em",
  //         width: "10%",
  //         borderBottom: "none",
  //         position: "relative",
  //       }}
  //     >
  //       {ratio}
  //       <SimulRatioTooltip
  //         numCompetitors={parseInt(
  //           isInverseSimulGroup
  //             ? simulGroup.numCompetitors
  //             : simulGroup.mainRound.numCompetitors
  //         )}
  //         roundName={simulRoundName}
  //       />
  //     </TableCell>
  //     <TableCell sx={{ minWidth: "10em", width: "20%", borderBottom: "none" }}>
  //       <ScheduledTimeInput
  //         isEditingTime={isEditingTime}
  //         setEditingTime={() => setIsEditingTime(true)}
  //         round={simulGroup.mainRound}
  //         onChange={(value) => onUpdate("scheduledTime", value)}
  //       />
  //     </TableCell>
  //   </TableRow>
  // );
};
