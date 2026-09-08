import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { refreshAuthTokens } from '../../../shared/api/api-client';
import { clearAuthTokens } from '../../../shared/api/tokens';
import {
  isBlockedAccountInfo,
  loginRequest,
  logoutRequest,
  passwordResetConfirmRequest,
  passwordResetRequest,
  registrationConfirmRequest,
  registrationRequest,
} from '../api/auth-api';
import { AuthContext, type AuthContextValue, type LoginStatus } from './auth-context';
import {
  clearBlockedAccountInfo,
  readBlockedAccountInfo,
  saveBlockedAccountInfo,
} from './blocked-session';

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [blockedInfo, setBlockedInfo] = useState(readBlockedAccountInfo);

  const clearBlockedState = useCallback(() => {
    clearBlockedAccountInfo();
    setBlockedInfo(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuthTokens();
        clearBlockedAccountInfo();
        setBlockedInfo(null);
        setIsAuth(true);
      } catch {
        clearAuthTokens();
        setIsAuth(false);
      } finally {
        setIsInitializing(false);
      }
    };

    void initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginStatus> => {
      const result = await loginRequest({ email, password });

      if (isBlockedAccountInfo(result)) {
        clearAuthTokens();
        saveBlockedAccountInfo(result);
        setBlockedInfo(result);
        setIsAuth(false);
        return 'blocked';
      }

      clearBlockedState();
      setIsAuth(true);
      return 'authenticated';
    },
    [clearBlockedState],
  );

  const requestRegistration = useCallback(async (email: string, password: string) => {
    const response = await registrationRequest({ email, password });
    return response.message;
  }, []);

  const confirmRegistration = useCallback(
    async (code: string) => {
      await registrationConfirmRequest({ code });
      clearBlockedState();
      setIsAuth(true);
    },
    [clearBlockedState],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const response = await passwordResetRequest({ email });
    return response.message;
  }, []);

  const confirmPasswordReset = useCallback(
    async (code: string, newPassword: string) => {
      await passwordResetConfirmRequest({ code, new_password: newPassword });
      clearBlockedState();
      setIsAuth(true);
    },
    [clearBlockedState],
  );

  const clearSession = useCallback(() => {
    clearAuthTokens();
    clearBlockedState();
    setIsAuth(false);
  }, [clearBlockedState]);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearBlockedState();
    setIsAuth(false);
  }, [clearBlockedState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuth,
      isInitializing,
      blockedInfo,
      login,
      requestRegistration,
      confirmRegistration,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      clearSession,
    }),
    [
      isAuth,
      isInitializing,
      blockedInfo,
      login,
      requestRegistration,
      confirmRegistration,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      clearSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
