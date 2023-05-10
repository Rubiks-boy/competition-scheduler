export const WCA_ORIGIN = "https://www.worldcubeassociation.org";

export const WCA_OAUTH_CLIENT_ID =
  "Vii5HFv_trp2PszV6AWn5kTD-iRCdLfH8NP3xw1Y7wc";

export const signIn = () => {
  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    response_type: "token",
    redirect_uri: window.location.href.split("#")[0],
    scope: "manage_competitions",
  });
  window.location.href = `${WCA_ORIGIN}/oauth/authorize?${params.toString()}`;
};

const localStorageKey = (key: string) =>
  `ScheduleGenerator.${WCA_OAUTH_CLIENT_ID}.${key}`;

export const wcaAccessToken = () =>
  localStorage.getItem(localStorageKey("accessToken"));

export const deleteAccessToken = () =>
  localStorage.removeItem(localStorageKey("accessToken"));

export const hasAccessToken = () => !!wcaAccessToken();

/**
 * Checks the URL hash for presence of OAuth access token
 * and saves it in the local storage if it's found.
 * Should be called on application initialization (before any kind of router takes over the location).
 */
export const initializeAuth = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  if (hashParams.has("access_token")) {
    localStorage.setItem(
      localStorageKey("accessToken"),
      hashParams.get("access_token") || ""
    );
  }
  if (hashParams.has("expires_in")) {
    /* Expire the token 15 minutes before it actually does,
       this way it doesn't expire right after the user enters the page. */
    // @ts-expect-error
    const expiresInSeconds = hashParams.get("expires_in") - 15 * 60;
    const expirationTime = new Date(
      new Date().getTime() + expiresInSeconds * 1000
    );
    localStorage.setItem(
      localStorageKey("expirationTime"),
      expirationTime.toISOString()
    );
  }
  /* If the token expired, sign the user out. */
  const expirationTime = localStorage.getItem(
    localStorageKey("expirationTime")
  );
  if (expirationTime && new Date() >= new Date(expirationTime)) {
    deleteAccessToken();
  }
  /* Clear the hash if there is a token. */
  if (hashParams.has("access_token")) {
    window.location.hash = "";
  }
};
