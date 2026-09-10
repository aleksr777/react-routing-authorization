import { useCallback, useState } from 'react';
import { getRetryAfterSeconds } from '../api/api-client';
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

  const applyResult = useCallback(
    (result: VerificationRequestResult) => {
      setMessage(result.message);
      setMaxAttempts(result.max_attempts);
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

  const reset = useCallback(() => {
    setMessage(null);
    setMaxAttempts(5);
    start(0);
  }, [start]);

  return {
    resendSeconds: seconds,
    message,
    maxAttempts,
    applyResult,
    applyRetryError,
    reset,
  };
};
