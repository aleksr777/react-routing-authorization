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

type AdminUsersResponse = {
  users: AdminUser[];
  total: number;
};

type MessageResponse = {
  message: string;
};

export const getAdminUsersRequest = async (
  search: string,
  limit: number,
  offset: number,
): Promise<AdminUsersResponse> => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const query = search.trim();
  if (query) params.set('search', query);

  return apiRequest<AdminUsersResponse>(`/admin/users/find?${params.toString()}`);
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

export const initiateAdminTransferRequest = async (id: number): Promise<string> => {
  const response = await apiRequest<MessageResponse>('/admin/transfer/initiate', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
  return response.message;
};

export const confirmAdminTransferRequest = async (code: string): Promise<string> => {
  const response = await apiRequest<MessageResponse>('/admin/transfer/confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return response.message;
};
