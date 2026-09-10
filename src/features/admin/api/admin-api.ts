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

export type AdminTransferStatus = {
  pending: boolean;
  target_user_id: number | null;
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

export const blockAdminUserRequest = async (
  id: number,
  blockedReason: string,
  password: string,
): Promise<void> => {
  await apiRequest(`/admin/users/block/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ blocked_reason: blockedReason.trim(), password }),
  });
};

export const unblockAdminUserRequest = async (id: number): Promise<void> => {
  await apiRequest(`/admin/users/unblock/${id}`, {
    method: 'PATCH',
  });
};

export const deleteAdminUserRequest = async (id: number, password: string): Promise<void> => {
  await apiRequest(`/admin/users/delete/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
};

export const getAdminTransferStatusRequest = async (): Promise<AdminTransferStatus> => {
  return apiRequest<AdminTransferStatus>('/admin/transfer/status');
};

export const initiateAdminTransferRequest = async (
  id: number,
  password: string,
): Promise<string> => {
  const response = await apiRequest<MessageResponse>('/admin/transfer/initiate', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  });
  return response.message;
};

export const cancelAdminTransferRequest = async (): Promise<string> => {
  const response = await apiRequest<MessageResponse>('/admin/transfer/cancel', {
    method: 'DELETE',
  });
  return response.message;
};

export const confirmAdminTransferRequest = async (
  code: string,
  password: string,
): Promise<string> => {
  const response = await apiRequest<MessageResponse>('/admin/transfer/confirm', {
    method: 'POST',
    retry: false,
    body: JSON.stringify({ code, password }),
  });
  return response.message;
};
