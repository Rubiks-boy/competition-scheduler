import { useEffect } from "react";
import { useDispatch } from "../app/hooks";
import { getAndDeleteRedirectUrl } from "../utils/auth";

export const useRedirectURL = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const redirectUrl = getAndDeleteRedirectUrl();

    if (window.location.search !== "?redirect") {
      return;
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/";
    }
  }, [dispatch]);
};
