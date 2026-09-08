import { createContext } from 'react';
import type { BlockedAccountInfo } from '../api/auth-api';

export type LoginOutcome =
  | { status: 'authenticated' }
  | { status: 'blocked'; info: BlockedAccountInfo };

export type AuthContextValue = {
  isAuth: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<LoginOutcome>;
  requestRegistration: (email: string, password: string) => Promise<string>;
  confirmRegistration: (code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
