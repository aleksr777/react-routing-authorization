import { apiRequest } from '../../../shared/api/api-client';
import { setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';
import type { LoginDto } from './auth-api.types';
import type { AdminLoginChallenge, BlockedAccountInfo, LoginResult } from './auth-api.models';

export const isAdminLoginChallenge = (value: LoginResult): value is AdminLoginChallenge =>
  'admin_confirmation_required' in value && value.admin_confirmation_required === true;

export const isBlockedAccountInfo = (value: LoginResult): value is BlockedAccountInfo =>
  'blocked' in value && value.blocked === true;

export const loginRequest = async (dto: LoginDto): Promise<LoginResult> => {
  const result = await apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify(dto),
  });

  if (!isBlockedAccountInfo(result) && !isAdminLoginChallenge(result)) {
    setAuthTokens(result);
  }
  return result;
};

export const confirmAdminLoginRequest = async (
  challengeId: string,
  code: string,
): Promise<void> => {
  const tokens = await apiRequest<AuthTokens>('/auth/login/admin/confirm', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ challenge_id: challengeId, code }),
  });
  setAuthTokens(tokens);
};

export const resendAdminLoginRequest = (challengeId: string): Promise<AdminLoginChallenge> =>
  apiRequest<AdminLoginChallenge>('/auth/login/admin/resend', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ challenge_id: challengeId }),
  });
