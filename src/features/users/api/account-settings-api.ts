import { apiRequest } from '../../../shared/api/api-client';
import { setAuthTokens, type AuthTokens } from '../../../shared/api/tokens';

type PasswordChangeRequestResponse = {
  code: string;
};

export type EmailChangeStatus = {
  locked: boolean;
  retry_after: number;
  max_attempts: number;
  attempts_remaining: number;
};

export const requestPasswordChange = async (
  oldPassword: string,
): Promise<PasswordChangeRequestResponse> =>
  apiRequest<PasswordChangeRequestResponse>('/users/me/password/change/request', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword }),
  });

export const confirmPasswordChange = async (code: string, newPassword: string): Promise<void> => {
  const result = await apiRequest<AuthTokens>('/users/me/password/change/confirm', {
    method: 'POST',
    retry: false,
    body: JSON.stringify({ code, new_password: newPassword }),
  });

  setAuthTokens(result);
};

export const requestCurrentUserPasswordReset = async (): Promise<void> => {
  await apiRequest('/users/me/password/reset/request', {
    method: 'POST',
  });
};

export const confirmCurrentUserPasswordReset = async (
  code: string,
  newPassword: string,
): Promise<void> => {
  const result = await apiRequest<AuthTokens>('/users/me/password/reset/confirm', {
    method: 'POST',
    retry: false,
    body: JSON.stringify({ code, new_password: newPassword }),
  });

  setAuthTokens(result);
};

export const getEmailChangeStatus = async (): Promise<EmailChangeStatus> => {
  return apiRequest<EmailChangeStatus>('/users/me/email/update/status');
};

export const requestEmailChange = async (newEmail: string): Promise<void> => {
  await apiRequest('/users/me/email/update/request', {
    method: 'POST',
    body: JSON.stringify({ new_email: newEmail }),
  });
};

export const confirmEmailChange = async (code: string): Promise<void> => {
  const result = await apiRequest<AuthTokens>('/users/me/email/update/confirm', {
    method: 'POST',
    retry: false,
    body: JSON.stringify({ code }),
  });

  setAuthTokens(result);
};
