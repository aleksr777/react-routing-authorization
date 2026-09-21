import { useEffect, useState, type FormEvent } from 'react';
import ConfirmationInput from '../../components/confirmation-input/confirmation-input';
import { resendAdminLoginRequest } from '../../features/auth/api/auth-api';
import { useAuth } from '../../features/auth/model/use-auth';
import {
  getAttemptsRemaining,
  getRetryAfterSeconds,
  isVerificationLocked,
} from '../../shared/api/api-client';
import { formatCountdown } from '../../shared/model/countdown';
import type { AdminLoginConfirmProps } from './admin-login-confirm.types';
import styles from './login.module.css';

const AdminLoginConfirm = ({
  challenge,
  onChallenge,
  onConfirmed,
  onBack,
}: AdminLoginConfirmProps) => {
  const { confirmAdminLogin } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [attempts, setAttempts] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [retryAt, setRetryAt] = useState(() => Date.now() + challenge.retry_after * 1000);
  const [expiresAt] = useState(() => Date.now() + challenge.expires_in * 1000);
  const [now, setNow] = useState(Date.now);
  // Wall-clock deadlines also stay accurate when a background tab is throttled.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const retrySeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  const expired = now >= expiresAt;

  const reportError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'Login confirmation failed');
    const remaining = getAttemptsRemaining(err);
    if (remaining !== null) setAttempts(remaining);
    if (remaining === 0 || isVerificationLocked(err)) setUnavailable(true);
    const retry = getRetryAfterSeconds(err);
    if (retry !== null) setRetryAt(Date.now() + retry * 1000);
  };

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || expired || unavailable || !/^\d{6}$/.test(code)) return;
    setIsBusy(true);
    setError(null);
    try {
      await confirmAdminLogin(challenge.challenge_id, code);
      setCode('');
      onConfirmed();
    } catch (err) {
      setCode('');
      reportError(err);
    } finally {
      setIsBusy(false);
    }
  };

  const resend = async () => {
    if (isBusy || retrySeconds > 0 || unavailable || expired) return;
    setIsBusy(true);
    setError(null);
    try {
      onChallenge(await resendAdminLoginRequest(challenge.challenge_id));
    } catch (err) {
      reportError(err);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <form className={styles.form} autoComplete="off" onSubmit={handleConfirm}>
      <p>{challenge.message}</p>
      <label className={styles.label}>
        Email confirmation code
        <ConfirmationInput
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          disabled={isBusy || expired || unavailable}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      <p>Maximum {challenge.max_attempts} code attempts.</p>
      {attempts !== null && <p>Attempts remaining: {attempts}.</p>}
      {expired && <p role="alert">The code has expired. Sign in again to request a new code.</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button
        className={styles.button}
        type="submit"
        disabled={isBusy || expired || unavailable || !/^\d{6}$/.test(code)}
      >
        {isBusy ? 'Please wait...' : 'Confirm sign-in'}
      </button>
      <button
        className={styles.button}
        type="button"
        disabled={isBusy || retrySeconds > 0 || unavailable || expired}
        onClick={() => void resend()}
      >
        {retrySeconds > 0 ? `Resend code in ${formatCountdown(retrySeconds)}` : 'Resend code'}
      </button>
      <button className={styles.button} type="button" disabled={isBusy} onClick={onBack}>
        Back to login
      </button>
    </form>
  );
};

export default AdminLoginConfirm;
