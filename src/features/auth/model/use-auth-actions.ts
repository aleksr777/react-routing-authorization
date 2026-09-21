import { useCallback } from 'react';
import { clearAuthTokens } from '../../../shared/api/tokens';
import {
  confirmAdminLoginRequest,
  isAdminLoginChallenge,
  isBlockedAccountInfo,
  loginRequest,
  logoutRequest,
  passwordResetConfirmRequest,
  passwordResetRequest,
  registrationConfirmRequest,
  registrationRequest,
  registrationResendRequest,
} from '../api/auth-api';
import type { LoginOutcome } from './auth-context';

type Params = {
  setAuthenticated: () => void;
  setUnauthenticated: () => void;
  endSession: () => void;
};

export const useAuthActions = ({ setAuthenticated, setUnauthenticated, endSession }: Params) => {
  const login = useCallback(
    async (email: string, password: string): Promise<LoginOutcome> => {
      const result = await loginRequest({ email, password });
      if (isBlockedAccountInfo(result)) {
        clearAuthTokens();
        setUnauthenticated();
        return { status: 'blocked', info: result };
      }
      if (isAdminLoginChallenge(result)) {
        clearAuthTokens();
        setUnauthenticated();
        return { status: 'admin-confirmation', challenge: result };
      }
      setAuthenticated();
      return { status: 'authenticated' };
    },
    [setAuthenticated, setUnauthenticated],
  );

  const confirmAdminLogin = useCallback(
    async (challengeId: string, code: string) => {
      await confirmAdminLoginRequest(challengeId, code);
      setAuthenticated();
    },
    [setAuthenticated],
  );

  const requestRegistration = useCallback(
    (email: string, password: string) => registrationRequest({ email, password }),
    [],
  );
  const resendRegistration = useCallback(
    (email: string) => registrationResendRequest({ email }),
    [],
  );
  const confirmRegistration = useCallback(
    async (code: string, email: string) => {
      await registrationConfirmRequest({ code, email });
      setAuthenticated();
    },
    [setAuthenticated],
  );
  const requestPasswordReset = useCallback((email: string) => passwordResetRequest({ email }), []);
  const confirmPasswordReset = useCallback(
    async (code: string, newPassword: string, email: string) => {
      await passwordResetConfirmRequest({ code, email, new_password: newPassword });
      setAuthenticated();
    },
    [setAuthenticated],
  );
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      endSession();
    }
  }, [endSession]);

  return {
    login,
    confirmAdminLogin,
    requestRegistration,
    resendRegistration,
    confirmRegistration,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
  };
};
