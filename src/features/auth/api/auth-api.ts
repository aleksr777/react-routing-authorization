import { apiRequest } from '../../../shared/api/api-client';
import { clearAuthTokens, setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';

type LoginDto = {
  email: string;
  password: string;
};

export const loginRequest = async (dto: LoginDto): Promise<AuthTokens> => {
  const tokens = await apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

  setAuthTokens(tokens);

  return tokens;
};

export const logoutRequest = async (): Promise<void> => {
  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
      auth: 'access',
      retry: false,
    });
  } finally {
    clearAuthTokens();
  }
};
