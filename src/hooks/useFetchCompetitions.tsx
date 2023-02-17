import React, { useEffect, useState } from "react";
import {
  fetchManageableComps,
  isCompRequestPendingSelector,
} from "../app/competitionsSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";

export const useFetchCompetitions = () => {
  const dispatch = useAppDispatch();
  const isCompRequestPending = useAppSelector(isCompRequestPendingSelector);
  const [hasDispatched, setHasDispatched] = useState(false);

  useEffect(() => {
    if (hasDispatched) {
      return;
    }

    dispatch(fetchManageableComps());
    setHasDispatched(true);
  }, [dispatch, hasDispatched]);

  return hasDispatched && !isCompRequestPending;
};
