import { apiRequest } from '../../../shared/api/api-client';
import { setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';
import type {
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  RegistrationConfirmDto,
  RegistrationRequestDto,
  RegistrationResendDto,
} from './auth-api.types';
import type { VerificationRequestResult } from './auth-api.models';

export type {
  AdminLoginChallenge,
  BlockedAccountInfo,
  VerificationRequestResult,
} from './auth-api.models';
export {
  confirmAdminLoginRequest,
  isAdminLoginChallenge,
  isBlockedAccountInfo,
  loginRequest,
  resendAdminLoginRequest,
} from './login-api';

export const validateSessionRequest = async (): Promise<void> => {
  await apiRequest<null>('/auth/session', {
    method: 'GET',
    auth: 'access',
  });
};

export const registrationRequest = (
  dto: RegistrationRequestDto,
): Promise<VerificationRequestResult> =>
  apiRequest<VerificationRequestResult>('/auth/registration/request', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

export const registrationResendRequest = (
  dto: RegistrationResendDto,
): Promise<VerificationRequestResult> =>
  apiRequest<VerificationRequestResult>('/auth/registration/resend', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

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

export const passwordResetRequest = (
  dto: PasswordResetRequestDto,
): Promise<VerificationRequestResult> =>
  apiRequest<VerificationRequestResult>('/auth/password-reset/request', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

export const passwordResetConfirmRequest = async (
  dto: PasswordResetConfirmDto,
): Promise<AuthTokens> => {
  const tokens = await apiRequest<AuthTokens>('/auth/password-reset/confirm', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });
  setAuthTokens(tokens);
  return tokens;
};

export const logoutRequest = async (): Promise<void> => {
  await apiRequest<unknown>('/auth/logout', {
    method: 'POST',
    auth: 'access',
    retry: false,
  });
};
