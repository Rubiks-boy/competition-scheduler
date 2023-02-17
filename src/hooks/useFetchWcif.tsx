import { useEffect, useState } from "react";
import { accessTokenSelector, selectedCompSelector } from "../app/selectors";
import { useDispatch, useSelector } from "../app/hooks";
import { fetchWcif } from "../utils/wcaApi";

export const useFetchWcif = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(accessTokenSelector);

  const selectedComp = useSelector(selectedCompSelector);

  const [hasDispatched, setHasDispatched] = useState(false);

  useEffect(() => {
    if (hasDispatched || !accessToken || !selectedComp) {
      return;
    }

    const runEffect = async () => {
      dispatch({ type: "FETCH_WCIF_PENDING" });

      const wcif = await fetchWcif(selectedComp.id, accessToken);

      if (!wcif) {
        dispatch({ type: "FETCH_WCIF_ERROR" });
        return;
      }

      dispatch({ type: "FETCH_WCIF_SUCCESS", wcif });
    };

    setHasDispatched(true);
    runEffect();
  }, [dispatch, hasDispatched, accessToken, selectedComp]);
};
