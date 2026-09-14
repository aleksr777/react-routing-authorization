import { apiRequest } from '../../../shared/api/api-client';
import { setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';

export type MfaRequiredInfo = {
  mfa_required: true;
  challenge: string;
};

type MfaStatus = {
  enabled: boolean;
};

export type MfaSetup = {
  secret: string;
  otpauth_uri: string;
  expires_in: number;
};

export const isMfaRequiredInfo = (value: unknown): value is MfaRequiredInfo => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'mfa_required' in value &&
    value.mfa_required === true
  );
};

export const mfaLoginRequest = async (challenge: string, code: string): Promise<AuthTokens> => {
  const tokens = await apiRequest<AuthTokens>('/auth/mfa/totp/login', {
    method: 'POST',
    auth: 'none',
    body: JSON.stringify({ challenge, code }),
  });
  setAuthTokens(tokens);
  return tokens;
};

export const getMfaStatusRequest = (): Promise<MfaStatus> => {
  return apiRequest<MfaStatus>('/auth/mfa/totp/status');
};

export const beginMfaSetupRequest = (): Promise<MfaSetup> => {
  return apiRequest<MfaSetup>('/auth/mfa/totp/setup', { method: 'POST' });
};

export const enableMfaRequest = (password: string, code: string): Promise<MfaStatus> => {
  return apiRequest<MfaStatus>('/auth/mfa/totp/enable', {
    method: 'POST',
    body: JSON.stringify({ password, code }),
  });
};

export const disableMfaRequest = (password: string, code: string): Promise<MfaStatus> => {
  return apiRequest<MfaStatus>('/auth/mfa/totp/disable', {
    method: 'POST',
    body: JSON.stringify({ password, code }),
  });
};
