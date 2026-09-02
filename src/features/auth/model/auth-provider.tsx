import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { refreshAuthTokens } from '../../../shared/api/api-client';
import { clearAuthTokens } from '../../../shared/api/tokens';
import {
  loginRequest,
  logoutRequest,
  registrationConfirmRequest,
  registrationRequest,
} from '../api/auth-api';
import { AuthContext, type AuthContextValue } from './auth-context';

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

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest({ email, password });
    setIsAuth(true);
  }, []);

  const requestRegistration = useCallback(async (email: string, password: string) => {
    const response = await registrationRequest({ email, password });

    return response.message;
  }, []);

  const confirmRegistration = useCallback(async (code: string) => {
    await registrationConfirmRequest({ code });
    setIsAuth(true);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setIsAuth(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuth,
      isInitializing,
      login,
      requestRegistration,
      confirmRegistration,
      logout,
    }),
    [isAuth, isInitializing, login, requestRegistration, confirmRegistration, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
