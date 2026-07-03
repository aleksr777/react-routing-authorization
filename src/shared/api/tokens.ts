export type AuthTokens = {
  access_token: string;
  access_token_expires: number | null;
};

let accessToken: string | null = null;
let accessTokenExpires: number | null = null;

export const setAuthTokens = (tokens: AuthTokens): void => {
  accessToken = tokens.access_token;
  accessTokenExpires = tokens.access_token_expires;
};

export const clearAuthTokens = (): void => {
  accessToken = null;
  accessTokenExpires = null;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const getAccessTokenExpires = (): number | null => {
  return accessTokenExpires;
};

export const hasAccessToken = (): boolean => {
  return Boolean(accessToken);
};
