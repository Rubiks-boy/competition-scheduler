import { WCA_ORIGIN } from "./auth";
import type { ManageableCompetition } from "../types";
import type { Wcif } from "../types";

const wcaApiFetch = (
  path: string,
  wcaAccessToken: string,
  fetchOptions = {}
) => {
  const baseApiUrl = `${WCA_ORIGIN}/api/v0`;

  return fetch(
    `${baseApiUrl}${path}`,
    Object.assign({}, fetchOptions, {
      headers: new Headers({
        Authorization: `Bearer ${wcaAccessToken}`,
        "Content-Type": "application/json",
      }),
    })
  )
    .then((response) => {
      if (!response.ok) throw new Error(response.statusText);
      return response;
    })
    .then((response) => response.json());
};

export const fetchUpcomingManageableCompetitions = (
  wcaAccessToken: string
): Promise<Array<ManageableCompetition>> => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: "true",
    start: oneWeekAgo.toISOString(),
  });
  return wcaApiFetch(`/competitions?${params.toString()}`, wcaAccessToken);
};

export const fetchWcif = (
  competitionId: string,
  wcaAccessToken: string
): Promise<Wcif> => {
  return wcaApiFetch(
    `/competitions/${competitionId}/wcif/public`,
    wcaAccessToken
  );
};
