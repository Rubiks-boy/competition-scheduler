import React, { useEffect, useState } from "react";
import { accessTokenSelector } from "../app/authSlice";
import {
  fetchManageableComps,
  isCompRequestPendingSelector,
} from "../app/competitionsSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";

export const useFetchCompetitions = () => {
  const dispatch = useAppDispatch();

  const isCompRequestPending = useAppSelector(isCompRequestPendingSelector);
  const accessToken = useAppSelector(accessTokenSelector);

  const [hasDispatched, setHasDispatched] = useState(false);

  useEffect(() => {
    if (hasDispatched || !accessToken) {
      return;
    }

    dispatch(fetchManageableComps(accessToken));
    setHasDispatched(true);
  }, [dispatch, hasDispatched, accessToken]);

  return hasDispatched && !isCompRequestPending;
};
