import { apiRequest } from '../../../shared/api/api-client';
import type { UserRole } from '../../users/api/users-api';

export type AdminUser = {
  id: number;
  email: string;
  nickname: string | null;
  name: string | null;
  age: number | null;
  role: UserRole;
  is_blocked: boolean;
  blocked_reason: string | null;
};

export const getAdminUsersRequest = async (search: string): Promise<AdminUser[]> => {
  const params = new URLSearchParams({
    limit: '20',
    offset: '0',
  });

  const query = search.trim();
  if (query) params.set('search', query);

  return apiRequest<AdminUser[]>(`/admin/users/find?${params.toString()}`);
};

export const getAdminUserRequest = async (id: number): Promise<AdminUser> => {
  return apiRequest<AdminUser>(`/admin/users/${id}`);
};

export const blockAdminUserRequest = async (id: number, blockedReason: string): Promise<void> => {
  await apiRequest(`/admin/users/block/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ blocked_reason: blockedReason.trim() }),
  });
};

export const unblockAdminUserRequest = async (id: number): Promise<void> => {
  await apiRequest(`/admin/users/unblock/${id}`, {
    method: 'PATCH',
  });
};

export const deleteAdminUserRequest = async (id: number): Promise<void> => {
  await apiRequest(`/admin/users/delete/${id}`, {
    method: 'DELETE',
  });
};
