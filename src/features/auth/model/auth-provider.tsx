import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { refreshAuthTokens } from '../../../shared/api/api-client';
import { clearAuthTokens, subscribeAuthTokensCleared } from '../../../shared/api/tokens';
import {
  isBlockedAccountInfo,
  isAdminLoginChallenge,
  confirmAdminLoginRequest,
  loginRequest,
  logoutRequest,
  passwordResetConfirmRequest,
  passwordResetRequest,
  registrationConfirmRequest,
  registrationRequest,
  registrationResendRequest,
} from '../api/auth-api';
import { AuthContext, type AuthContextValue, type LoginOutcome } from './auth-context';

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Retain the redirect intent until Home has committed, then allow normal protected links.
    if (isEndingSession && !isAuth && pathname === '/') setIsEndingSession(false);
  }, [isAuth, isEndingSession, pathname]);

  useEffect(() => {
    return subscribeAuthTokensCleared(() => setIsAuth(false));
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuthTokens();
        setIsAuth(true);
      } catch {
        clearAuthTokens(false);
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

    if (isAdminLoginChallenge(result)) {
      clearAuthTokens();
      setIsAuth(false);
      return { status: 'admin-confirmation', challenge: result };
    }

    setIsAuth(true);
    return { status: 'authenticated' };
  }, []);

  const confirmAdminLogin = useCallback(async (challengeId: string, code: string) => {
    await confirmAdminLoginRequest(challengeId, code);
    setIsAuth(true);
  }, []);

  const requestRegistration = useCallback(async (email: string, password: string) => {
    return registrationRequest({ email, password });
  }, []);

  const resendRegistration = useCallback(async (email: string) => {
    return registrationResendRequest({ email });
  }, []);

  const confirmRegistration = useCallback(async (code: string, email: string) => {
    await registrationConfirmRequest({ code, email });
    setIsAuth(true);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return passwordResetRequest({ email });
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

  const endSession = useCallback(() => {
    setIsEndingSession(true);
    clearAuthTokens();
    setIsAuth(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsEndingSession(true);
    try {
      await logoutRequest();
    } finally {
      endSession();
    }
  }, [endSession]);

  const value: AuthContextValue = {
    isAuth,
    isInitializing,
    isEndingSession,
    login,
    confirmAdminLogin,
    requestRegistration,
    resendRegistration,
    confirmRegistration,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    endSession,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
