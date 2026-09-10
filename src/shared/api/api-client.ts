import {
  clearAuthTokens,
  getAccessToken,
  isAccessTokenExpiringSoon,
  setAuthTokens,
  type AuthTokens,
} from './tokens';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5174/api';

type AuthMode = 'access' | 'none';

type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  auth?: AuthMode;
  headers?: Record<string, string>;
  retry?: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getPayloadNumber = (error: unknown, field: string): number | null => {
  if (!(error instanceof ApiError)) return null;
  if (typeof error.payload !== 'object' || error.payload === null) return null;
  if (!(field in error.payload)) return null;

  const value = (error.payload as Record<string, unknown>)[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const getRetryAfterSeconds = (error: unknown): number | null => {
  const retryAfter = getPayloadNumber(error, 'retry_after');
  return retryAfter === null ? null : Math.max(0, Math.ceil(retryAfter));
};

export const getAttemptsRemaining = (error: unknown): number | null => {
  const attemptsRemaining = getPayloadNumber(error, 'attempts_remaining');
  return attemptsRemaining === null ? null : Math.max(0, Math.floor(attemptsRemaining));
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) return response.json();

  const text = await response.text();
  return text || null;
};

const getErrorMessage = (payload: unknown): string => {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }

  return 'Request failed';
};

let refreshPromise: Promise<AuthTokens> | null = null;

const performRefreshAuthTokens = async (): Promise<AuthTokens> => {
  const response = await fetch(`${API_URL}/auth/refresh-tokens`, {
    method: 'POST',
    credentials: 'include',
  });
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    clearAuthTokens();
    throw new ApiError(response.status, getErrorMessage(payload), payload);
  }

  const tokens = payload as AuthTokens;
  setAuthTokens(tokens);
  return tokens;
};

export const refreshAuthTokens = (): Promise<AuthTokens> => {
  if (!refreshPromise) {
    refreshPromise = performRefreshAuthTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { auth = 'access', retry = true, headers = {}, ...rest } = options;

  if (auth === 'access' && isAccessTokenExpiringSoon()) {
    await refreshAuthTokens();
  }

  const accessToken = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(auth === 'access' && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  const payload = await parseResponseBody(response);

  if (response.status === 401 && auth === 'access' && retry) {
    await refreshAuthTokens();
    return apiRequest<T>(path, { ...options, retry: false });
  }

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(payload), payload);
  }

  return payload as T;
};
