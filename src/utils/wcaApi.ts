import { WCA_ORIGIN } from "./auth";
import type { ManageableCompetition } from "../types";
import type { Wcif } from "../types";
import { pick } from "./utils";

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
  ).then((response) => response.json());
};

export const fetchUpcomingManageableCompetitions = (
  wcaAccessToken: string
): Promise<Array<ManageableCompetition>> => {
  const oneWeekAgo = new Date(Date.now() - 30 * 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: "true",
    start: oneWeekAgo.toISOString(),
  });
  return wcaApiFetch(`/competitions?${params.toString()}`, wcaAccessToken);
};

export const fetchCompetition = (
  competitionId: string,
  wcaAccessToken: string
): Promise<ManageableCompetition> => {
  return wcaApiFetch(`/competitions/${competitionId}`, wcaAccessToken);
};

export const fetchWcif = (
  competitionId: string,
  wcaAccessToken: string
): Promise<Wcif> => {
  return wcaApiFetch(`/competitions/${competitionId}/wcif`, wcaAccessToken);
};

const updateWcif = (
  competitionId: string,
  wcif: Partial<Wcif>,
  wcaAccessToken: string
) => {
  return wcaApiFetch(`/competitions/${competitionId}/wcif`, wcaAccessToken, {
    method: "PATCH",
    body: JSON.stringify(wcif),
  });
};

export const saveWcifChanges = (
  previousWcif: Wcif,
  newWcif: Wcif,
  wcaAccessToken: string
) => {
  const keysDiff = Object.keys(newWcif).filter(
    // @ts-expect-error
    (key) => previousWcif[key] !== newWcif[key]
  );
  if (keysDiff.length === 0) return Promise.resolve();
  return updateWcif(newWcif.id, pick(newWcif, keysDiff), wcaAccessToken);
};
