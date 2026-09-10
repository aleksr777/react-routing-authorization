import { useCallback, useState } from 'react';
import { getAttemptsRemaining, getRetryAfterSeconds } from '../api/api-client';
import { useCountdown } from './countdown';

type VerificationRequestResult = {
  message: string;
  retry_after: number;
  max_attempts: number;
};

export const useVerificationRequestState = () => {
  const { seconds, start } = useCountdown();
  const [message, setMessage] = useState<string | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const applyResult = useCallback(
    (result: VerificationRequestResult) => {
      setMessage(result.message);
      setMaxAttempts(result.max_attempts);
      setAttemptsRemaining(null);
      start(result.retry_after);
    },
    [start],
  );

  const applyRetryError = useCallback(
    (error: unknown) => {
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter === null) return false;
      start(retryAfter);
      return true;
    },
    [start],
  );

  const applyAttemptError = useCallback((error: unknown) => {
    const remaining = getAttemptsRemaining(error);
    if (remaining === null) return false;
    setAttemptsRemaining(remaining);
    return true;
  }, []);

  const reset = useCallback(() => {
    setMessage(null);
    setMaxAttempts(5);
    setAttemptsRemaining(null);
    start(0);
  }, [start]);

  return {
    resendSeconds: seconds,
    message,
    maxAttempts,
    attemptsRemaining,
    applyResult,
    applyRetryError,
    applyAttemptError,
    reset,
  };
};
