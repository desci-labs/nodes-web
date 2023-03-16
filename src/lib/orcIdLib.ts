export const LOCALSTORAGE_ORCID_EXPIRY = "orcid:expiry";
export const LOCALSTORAGE_ORCID_ACCESS_TOKEN = "orcid:access";
export const LOCALSTORAGE_ORCID_ID = "orcid:id";
/**
 * JWT is not sent to the server during auth, therefore we don't actually have this value
 * We'd need to use the access token to get the JWT from the ORCID API
 */
export const LOCALSTORAGE_ORCID_JWT = "orcid:jwt";

export interface OrcData {
  orcid: string;
  orcid_access_token: string;
  orcid_expires_in: number;
  orcid_refresh_token: string;
  jwtToken?: string;
}

export const storeOrcDataLocally = (orcData: OrcData) => {
  localStorage.setItem(LOCALSTORAGE_ORCID_ID, orcData.orcid);
  localStorage.setItem(
    LOCALSTORAGE_ORCID_ACCESS_TOKEN,
    orcData.orcid_access_token
  );
  localStorage.setItem(LOCALSTORAGE_ORCID_EXPIRY, orcData.orcid);
};
