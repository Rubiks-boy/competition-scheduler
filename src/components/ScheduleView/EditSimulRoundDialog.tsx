// import { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Button,
//   IconButton,
//   DialogActions,
// } from "@mui/material";
// import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
// import { EventTable } from "../EventsView/EventTable";
// import { RoundRow } from "../EventsView/RoundRow";
import type { EventId, Round, ScheduleEntry } from "../../types";
// import { useDispatch, useSelector } from "../../app/hooks";
// import { numStationsSelector, roundSelector } from "../../app/selectors";
// import type {
//   UpdatableRoundField,
//   UpdatableSimulField,
// } from "../EventsView/RoundRow/types";

export const EditSimulScheduleDialog = ({
  primaryRound,
  primaryScheduleEntry,
  secondaryEventId,
  secondaryRoundNum,
}: {
  primaryRound: Round;
  primaryScheduleEntry: ScheduleEntry & { type: "event" };
  secondaryEventId: EventId;
  secondaryRoundNum: number;
}) => {
  return null;
  // const dispatch = useDispatch();
  // const secondaryRound = useSelector(
  //   roundSelector(secondaryEventId, secondaryRoundNum)
  // );
  // const numStations = useSelector(numStationsSelector);
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const openDialog = () => setIsDialogOpen(true);
  // const closeDialog = () => setIsDialogOpen(false);

  // const makeOnUpdateRound = (eventId: EventId, roundNum: number) => {
  //   return (
  //     field: UpdatableRoundField,
  //     value: string,
  //     isEditingTime: boolean
  //   ) => {
  //     dispatch({
  //       type: "ROUND_UPDATED",
  //       eventId,
  //       roundNum,
  //       isEditingTime,
  //       [field]: value,
  //     });
  //   };
  // };

  // const makeOnUpdateSimulRound = (
  //   eventId: EventId,
  //   roundNum: number,
  //   mainRound: { eventId: EventId; roundNum: number }
  // ) => {
  //   return (field: UpdatableSimulField, value: string) => {
  //     dispatch({
  //       type: "UPDATE_SIMUL_ROUND",
  //       eventId,
  //       roundNum,
  //       mainRound,
  //       [field]: value,
  //     });
  //   };
  // };

  // const dialog = (
  //   <Dialog open={isDialogOpen} onClose={closeDialog} maxWidth="md">
  //     <DialogTitle>Edit simultaneous event</DialogTitle>
  //     <DialogContent>
  //       <EventTable>
  //         <RoundRow
  //           round={primaryRound}
  //           roundNum={primaryScheduleEntry.roundNum}
  //           isFinal={false}
  //           numStations={numStations}
  //           onUpdateRound={makeOnUpdateRound(
  //             primaryScheduleEntry.eventId,
  //             primaryScheduleEntry.roundNum
  //           )}
  //           makeOnUpdateSimulRound={makeOnUpdateSimulRound}
  //           numCompetitorsInt={0}
  //           numRegistered={0}
  //         />
  //         {secondaryRound && (
  //           <RoundRow
  //             round={secondaryRound}
  //             roundNum={secondaryRoundNum}
  //             isFinal={false}
  //             numStations={numStations}
  //             onUpdateRound={makeOnUpdateRound(
  //               secondaryRound.eventId,
  //               secondaryRoundNum
  //             )}
  //             makeOnUpdateSimulRound={makeOnUpdateSimulRound}
  //             numCompetitorsInt={0}
  //             numRegistered={0}
  //           />
  //         )}
  //       </EventTable>
  //       {/* <ReorderGroups
  //         leftScheduleEntry={scheduleEntry}
  //         rightScheduleEntry={simulEvent.scheduleEntry}
  //       /> */}
  //     </DialogContent>
  //     <DialogActions>
  //       <Button onClick={closeDialog}>Done</Button>
  //     </DialogActions>
  //   </Dialog>
  // );

  // return (
  //   <>
  //     {dialog}
  //     <IconButton onClick={openDialog}>
  //       <SettingsSuggestIcon />
  //     </IconButton>
  //   </>
  // );
};
