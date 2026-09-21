import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { refreshAuthTokens } from '../../../shared/api/api-client';
import { clearAuthTokens, subscribeAuthTokensCleared } from '../../../shared/api/tokens';

export const useAuthSession = () => {
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

  useEffect(
    () =>
      subscribeAuthTokensCleared(() => {
        if (isAuthenticatedRef.current) {
          endSession();
          return;
        }
        setUnauthenticated();
      }),
    [endSession, setUnauthenticated],
  );

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
  }, [setAuthenticated, setUnauthenticated]);

  return {
    isAuth,
    isInitializing,
    isEndingSession,
    setAuthenticated,
    setUnauthenticated,
    endSession,
  };
};
