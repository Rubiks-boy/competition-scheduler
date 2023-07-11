import { useEffect } from "react";
import { useSelector } from "../app/hooks";
import {
  activeStepSelector,
  fromImportSelector,
  shareableAppStateSelector,
} from "../app/selectors";
import { Buffer } from "buffer";

export const useSaveToLocalStorage = () => {
  const shareableState = useSelector(shareableAppStateSelector);
  const fromImport = useSelector(fromImportSelector);
  const activeStep = useSelector(activeStepSelector);

  useEffect(() => {
    // Only export after the user has made some amount of progress making the schedule
    if (!shareableState.selectedCompId || activeStep === 0) {
      return;
    }

    const stateStr = JSON.stringify(shareableState);
    const encodedState = Buffer.from(stateStr).toString("base64");

    // Keep app state in local storage when someone is making a schedule from scratch
    // If viewing someone else's schedule, don't overwrite it
    if (!fromImport) {
      localStorage.setItem("ScheduleGenerator.savedAppState", encodedState);
    }
  }, [shareableState, fromImport, activeStep]);
};
