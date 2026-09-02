import { apiRequest } from '../../../shared/api/api-client';
import { clearAuthTokens, setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';

type LoginDto = {
  email: string;
  password: string;
};

type RegistrationRequestDto = {
  email: string;
  password: string;
};

type RegistrationConfirmDto = {
  code: string;
};

type MessageResponse = {
  message: string;
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

export const registrationRequest = async (
  dto: RegistrationRequestDto,
): Promise<MessageResponse> => {
  return apiRequest<MessageResponse>('/auth/registration/request', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });
};

export const registrationConfirmRequest = async (
  dto: RegistrationConfirmDto,
): Promise<AuthTokens> => {
  const tokens = await apiRequest<AuthTokens>('/auth/registration/confirm', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

  setAuthTokens(tokens);

  return tokens;
};

export const logoutRequest = async (): Promise<void> => {
  try {
    await apiRequest<unknown>('/auth/logout', {
      method: 'POST',
      auth: 'access',
      retry: false,
    });
  } finally {
    clearAuthTokens();
  }
};
