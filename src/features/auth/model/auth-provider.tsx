import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
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
  const isAuthenticatedRef = useRef(false);
  const isEndingSessionRef = useRef(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const setAuthenticated = useCallback(() => {
    isAuthenticatedRef.current = true;
    setIsAuth(true);
  }, []);

  const setUnauthenticated = useCallback(() => {
    isAuthenticatedRef.current = false;
    setIsAuth(false);
  }, []);

  useEffect(() => {
    // Retain the redirect intent until Home has committed, then allow normal protected links.
    if (isEndingSession && !isAuth && pathname === '/') {
      isEndingSessionRef.current = false;
      setIsEndingSession(false);
    }
  }, [isAuth, isEndingSession, pathname]);

  const endSession = useCallback(() => {
    if (isEndingSessionRef.current) return;
    isEndingSessionRef.current = true;
    setIsEndingSession(true);
    setUnauthenticated();
    clearAuthTokens();
    navigate('/', { replace: true });
  }, [navigate, setUnauthenticated]);

  useEffect(() => {
    return subscribeAuthTokensCleared(() => {
      if (isAuthenticatedRef.current) {
        endSession();
        return;
      }
      setUnauthenticated();
    });
  }, [endSession, setUnauthenticated]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuthTokens();
        setAuthenticated();
      } catch {
        clearAuthTokens(false);
        setUnauthenticated();
      } finally {
        setIsInitializing(false);
      }
    };

    void initializeAuth();
  }, []);

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

  const requestRegistration = useCallback(async (email: string, password: string) => {
    return registrationRequest({ email, password });
  }, []);

  const resendRegistration = useCallback(async (email: string) => {
    return registrationResendRequest({ email });
  }, []);

  const confirmRegistration = useCallback(
    async (code: string, email: string) => {
      await registrationConfirmRequest({ code, email });
      setAuthenticated();
    },
    [setAuthenticated],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    return passwordResetRequest({ email });
  }, []);

  const confirmPasswordReset = useCallback(
    async (code: string, newPassword: string, email: string) => {
      await passwordResetConfirmRequest({ code, email, new_password: newPassword });
      setAuthenticated();
    },
    [setAuthenticated],
  );

  const clearSession = endSession;

  const logout = useCallback(async () => {
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
