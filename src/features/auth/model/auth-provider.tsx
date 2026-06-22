import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { refreshAuthTokens } from '../../../shared/api/api-client';
import { clearAuthTokens, hasAuthTokens } from '../../../shared/api/tokens';
import { loginRequest, logoutRequest } from '../api/auth-api';
import { AuthContext, type AuthContextValue } from './auth-context';

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuth, setIsAuth] = useState(hasAuthTokens);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!hasAuthTokens()) {
        setIsAuth(false);
        setIsInitializing(false);

        return;
      }

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

  const logout = useCallback(async () => {
    await logoutRequest();
    setIsAuth(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuth,
      isInitializing,
      login,
      logout,
    }),
    [isAuth, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
