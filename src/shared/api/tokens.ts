export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  access_token_expires: number | null;
  refresh_token_expires: number | null;
};

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_EXPIRES_KEY = 'access_token_expires';
const REFRESH_TOKEN_EXPIRES_KEY = 'refresh_token_expires';

export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

  if (tokens.access_token_expires !== null) {
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, String(tokens.access_token_expires));
  }

  if (tokens.refresh_token_expires !== null) {
    localStorage.setItem(REFRESH_TOKEN_EXPIRES_KEY, String(tokens.refresh_token_expires));
  }
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const hasAuthTokens = (): boolean => {
  return Boolean(getAccessToken() && getRefreshToken());
};
