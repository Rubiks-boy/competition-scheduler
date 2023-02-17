import React, { useEffect, useState } from "react";
import { accessTokenSelector } from "../app/selectors";
import { useDispatch, useSelector } from "../app/hooks";
import { fetchUpcomingManageableCompetitions } from "../utils/wcaApi";

export const useFetchCompetitions = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(accessTokenSelector);

  const [hasDispatched, setHasDispatched] = useState(false);

  useEffect(() => {
    if (hasDispatched || !accessToken) {
      return;
    }

    const fetchManageableComps = async () => {
      dispatch({ type: "MANAGEABLE_COMPS_PENDING" });

      const manageableComps = await fetchUpcomingManageableCompetitions(
        accessToken
      );

      if (!manageableComps) {
        dispatch({ type: "MANAGEABLE_COMPS_ERROR" });
        return;
      }

      dispatch({ type: "MANAGEABLE_COMPS_SUCCESS", manageableComps });
    };

    setHasDispatched(true);
    fetchManageableComps();
  }, [dispatch, hasDispatched, accessToken]);
};
