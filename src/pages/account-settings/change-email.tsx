import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmEmailChange,
  requestEmailChange,
} from '../../features/users/api/account-settings-api';
import { getAttemptsRemaining } from '../../shared/api/api-client';
import { formatCountdown } from '../../shared/model/countdown';
import { useEmailChangeLockout } from './use-email-change-lockout';
import styles from './account-settings.module.css';

const ChangeEmail = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isLocked,
    lockoutSeconds,
    maxAttempts,
    attemptsRemaining,
    syncError,
    resetAttempts,
  } = useEmailChangeLockout();

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('newEmail') ?? '').trim();

    if (!email) {
      setError('Enter a new email');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await requestEmailChange(email);
      resetAttempts();
      setNewEmail(email);
    } catch (err: unknown) {
      await syncError(err);
      setError(err instanceof Error ? err.message : 'Email change request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmEmailChange(code);
      navigate('/users/me/settings', { replace: true });
    } catch (err: unknown) {
      const remaining = getAttemptsRemaining(err);
      await syncError(err);
      setError(err instanceof Error ? err.message : 'Email change failed');
      if (remaining === 0) {
        setNewEmail(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseAnotherEmail = () => {
    setError(null);
    setNewEmail(null);
  };

  const lockoutMessage = isLocked
    ? `Email change is temporarily locked. Try again in ${formatCountdown(lockoutSeconds)}.`
    : null;

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Change email</h2>

      {!newEmail ? (
        <form className={styles.form} onSubmit={handleRequest}>
          <label className={styles.label}>
            New email
            <input
              className={styles.input}
              name="newEmail"
              type="email"
              autoComplete="email"
              disabled={isLocked}
              required
            />
          </label>
          {lockoutMessage && <p className={styles.error}>{lockoutMessage}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={isSubmitting || isLocked}>
            {isSubmitting ? 'Sending code...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleConfirm}>
          <p className={styles.message}>Confirmation code sent to {newEmail}</p>
          <label className={styles.label}>
            Confirmation code
            <input
              className={styles.input}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              disabled={isLocked || attemptsRemaining === 0}
              required
            />
          </label>
          <p className={styles.message}>Maximum {maxAttempts} incorrect code attempts.</p>
          <p className={styles.message}>Attempts remaining: {attemptsRemaining}.</p>
          {lockoutMessage && <p className={styles.error}>{lockoutMessage}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.button}
            type="submit"
            disabled={isSubmitting || isLocked || attemptsRemaining === 0}
          >
            {isSubmitting ? 'Saving...' : 'Change email'}
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            disabled={isSubmitting}
            onClick={handleUseAnotherEmail}
          >
            Use another email
          </button>
        </form>
      )}
    </section>
  );
};

export default ChangeEmail;
