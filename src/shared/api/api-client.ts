import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  type AuthTokens,
} from './tokens';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:1603/api';

type AuthMode = 'access' | 'refresh' | 'none';

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

const getTokenByMode = (auth: AuthMode): string | null => {
  if (auth === 'access') return getAccessToken();
  if (auth === 'refresh') return getRefreshToken();

  return null;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

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

export const refreshAuthTokens = async (): Promise<AuthTokens> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthTokens();
    throw new ApiError(401, 'Refresh token is missing', null);
  }

  const response = await fetch(`${API_URL}/auth/refresh-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
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

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { auth = 'access', retry = true, headers = {}, ...rest } = options;
  const token = getTokenByMode(auth);

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await parseResponseBody(response);

  if (response.status === 401 && auth === 'access' && retry) {
    await refreshAuthTokens();

    return apiRequest<T>(path, {
      ...options,
      retry: false,
    });
  }

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(payload), payload);
  }

  return payload as T;
};
