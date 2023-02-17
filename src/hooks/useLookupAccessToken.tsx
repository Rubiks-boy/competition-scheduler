import React, { useEffect } from "react";
import { useDispatch } from "../app/hooks";
import { wcaAccessToken } from "../utils/auth";

export const useLookupAccessToken = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = wcaAccessToken();

    if (accessToken) {
      dispatch({ type: "SIGNIN_COMPLETE", accessToken });
    }
  });
};
