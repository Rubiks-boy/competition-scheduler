import { useEffect } from "react";
import { usePrevious, useSelector } from "../app/hooks";
import {
  activeStepSelector,
  importSourceSelector,
  isExportedSelector,
  shareableAppStateSelector,
} from "../app/selectors";
import { Buffer } from "buffer";

export const useSaveToLocalStorage = () => {
  const shareableState = useSelector(shareableAppStateSelector);
  const importSource = useSelector(importSourceSelector);
  const activeStep = useSelector(activeStepSelector);
  const isExported = useSelector(isExportedSelector);
  const wasExported = usePrevious(isExported);

  useEffect(() => {
    // Only export after the user has made some amount of progress making the schedule
    if (!shareableState.selectedCompId || activeStep === 0) {
      return;
    }

    const stateStr = JSON.stringify(shareableState);
    const encodedState = Buffer.from(stateStr).toString("base64");

    // Keep app state in local storage when someone is making a schedule from scratch
    // If viewing someone else's schedule, don't overwrite it
    if (importSource !== "url") {
      localStorage.setItem("ScheduleGenerator.savedAppState", encodedState);
    }
  }, [shareableState, importSource, activeStep]);

  useEffect(() => {
    if (isExported && !wasExported && importSource !== "url") {
      localStorage.removeItem("ScheduleGenerator.savedAppState");
    }
  }, [isExported, wasExported, importSource]);
};
