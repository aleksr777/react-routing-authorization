import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
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
import { AuthContext, type AuthContextValue, type LoginOutcome } from './auth-context';

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuthTokens();
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

  const login = useCallback(async (email: string, password: string): Promise<LoginOutcome> => {
    const result = await loginRequest({ email, password });
    if (isBlockedAccountInfo(result)) {
      clearAuthTokens();
      setIsAuth(false);
      return { status: 'blocked', info: result };
    }

    setIsAuth(true);
    return { status: 'authenticated' };
  }, []);

  const requestRegistration = useCallback(async (email: string, password: string) => {
    const response = await registrationRequest({ email, password });
    return response.message;
  }, []);

  const confirmRegistration = useCallback(async (code: string, email: string) => {
    await registrationConfirmRequest({ code, email });
    setIsAuth(true);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const response = await passwordResetRequest({ email });
    return response.message;
  }, []);

  const confirmPasswordReset = useCallback(
    async (code: string, newPassword: string, email: string) => {
      await passwordResetConfirmRequest({ code, email, new_password: newPassword });
      setIsAuth(true);
    },
    [],
  );

  const clearSession = useCallback(() => {
    clearAuthTokens();
    setIsAuth(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setIsAuth(false);
  }, []);

  const value: AuthContextValue = {
    isAuth,
    isInitializing,
    login,
    requestRegistration,
    confirmRegistration,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
