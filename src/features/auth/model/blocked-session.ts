import type { BlockedAccountInfo } from '../api/auth-api';

const BLOCKED_ACCOUNT_KEY = 'blocked-account';

export const readBlockedAccountInfo = (): BlockedAccountInfo | null => {
  const raw = sessionStorage.getItem(BLOCKED_ACCOUNT_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<BlockedAccountInfo>;
    if (
      value.blocked === true &&
      (typeof value.blocked_reason === 'string' || value.blocked_reason === null) &&
      typeof value.contact_email === 'string'
    ) {
      return value as BlockedAccountInfo;
    }
  } catch {
    sessionStorage.removeItem(BLOCKED_ACCOUNT_KEY);
  }

  return null;
};

export const saveBlockedAccountInfo = (info: BlockedAccountInfo): void => {
  sessionStorage.setItem(BLOCKED_ACCOUNT_KEY, JSON.stringify(info));
};

export const clearBlockedAccountInfo = (): void => {
  sessionStorage.removeItem(BLOCKED_ACCOUNT_KEY);
};
