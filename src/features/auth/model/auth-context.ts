import { createContext } from 'react';
import type { BlockedAccountInfo } from '../api/auth-api';

export type LoginStatus = 'authenticated' | 'blocked';

export type AuthContextValue = {
  isAuth: boolean;
  isInitializing: boolean;
  blockedInfo: BlockedAccountInfo | null;
  login: (email: string, password: string) => Promise<LoginStatus>;
  requestRegistration: (email: string, password: string) => Promise<string>;
  confirmRegistration: (code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
