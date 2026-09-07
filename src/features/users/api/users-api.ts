import { apiRequest } from '../../../shared/api/api-client';

export type CurrentUser = {
  id: number;
  email: string;
  nickname: string;
  role: string;
  is_blocked?: boolean;
  blocked_reason?: string | null;
};

export const getCurrentUserRequest = async (): Promise<CurrentUser> => {
  return apiRequest<CurrentUser>('/users/me');
};

export const deleteCurrentUserRequest = async (password: string): Promise<void> => {
  await apiRequest('/users/me/delete', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
};
