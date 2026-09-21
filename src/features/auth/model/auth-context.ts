import { createContext } from 'react';
import type {
  AdminLoginChallenge,
  BlockedAccountInfo,
  VerificationRequestResult,
} from '../api/auth-api';

export type LoginOutcome =
  | { status: 'authenticated' }
  | { status: 'admin-confirmation'; challenge: AdminLoginChallenge }
  | { status: 'blocked'; info: BlockedAccountInfo };

export type AuthContextValue = {
  isAuth: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<LoginOutcome>;
  confirmAdminLogin: (challengeId: string, code: string) => Promise<void>;
  requestRegistration: (email: string, password: string) => Promise<VerificationRequestResult>;
  resendRegistration: (email: string) => Promise<VerificationRequestResult>;
  confirmRegistration: (code: string, email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<VerificationRequestResult>;
  confirmPasswordReset: (code: string, newPassword: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
