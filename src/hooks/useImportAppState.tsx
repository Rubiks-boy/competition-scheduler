import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { accessTokenSelector, manageableCompsSelector } from "../app/selectors";
import { useDispatch, useSelector } from "../app/hooks";

const getAppStateFromUrl = () => {
  const query = window.location.search.substring(1);

  const parsedQueryParams = query.split("&").map((q) => {
    const item = q.split("=");
    return { key: item[0], value: item[1] };
  });

  return parsedQueryParams.find(({ key }) => key === "appState")?.value;
};

export const useImportAppState = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector(accessTokenSelector);
  const manageableComps = useSelector(manageableCompsSelector);

  const [hasDispatched, setHasDispatched] = useState(false);

  useEffect(() => {
    if (hasDispatched || !accessToken || !manageableComps) {
      return;
    }

    const maybeEncodedAppState = getAppStateFromUrl();

    if (!maybeEncodedAppState) {
      return;
    }

    const appStateStr = Buffer.from(maybeEncodedAppState, "base64").toString();
    const appState = JSON.parse(appStateStr);

    dispatch({ type: "IMPORT_APP_STATE", appState });

    setHasDispatched(true);
  }, [dispatch, hasDispatched, manageableComps, accessToken]);
};
