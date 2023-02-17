import { useEffect, useState } from "react";
import { accessTokenSelector, selectedCompSelector } from "../app/selectors";
import { useDispatch, useSelector } from "../app/hooks";
import { fetchWcif } from "../utils/wcaApi";

export const useFetchWcif = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(accessTokenSelector);

  const selectedComp = useSelector(selectedCompSelector);

  const [compCurrentlyFetched, setCompCurrentlyFetched] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      !accessToken ||
      !selectedComp ||
      compCurrentlyFetched === selectedComp.id
    ) {
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

    setCompCurrentlyFetched(selectedComp?.id);
    runEffect();
  }, [accessToken, compCurrentlyFetched, dispatch, selectedComp]);
};
