import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import styles from './registration.module.css';

const Registration = () => {
  const { isAuth, isInitializing, requestRegistration, confirmRegistration } = useAuth();
  const navigate = useNavigate();

  const [isCodeStep, setIsCodeStep] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistrationRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!email || !password || !passwordConfirm) {
      setError('Fill in all fields');
      return;
    }

    if (password.length < 8 || password.length > 100) {
      setError('Password must contain from 8 to 100 characters');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setIsSubmitting(true);

      const responseMessage = await requestRegistration(email, password);

      setMessage(responseMessage);
      setIsCodeStep(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      await confirmRegistration(code);
      navigate('/users/me', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration confirmation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return <p>Loading...</p>;
  }

  if (isAuth) {
    return <Navigate to="/users/me" replace />;
  }

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Registration</h1>

      {!isCodeStep ? (
        <form key="registration-request" className={styles.form} onSubmit={handleRegistrationRequest}>
          <label className={styles.label}>
            Email
            <input className={styles.input} name="email" type="email" autoComplete="email" required />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
            />
          </label>

          <label className={styles.label}>
            Repeat password
            <input
              className={styles.input}
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending code...' : 'Create account'}
          </button>
        </form>
      ) : (
        <form key="registration-confirm" className={styles.form} onSubmit={handleRegistrationConfirm}>
          {message && <p className={styles.message}>{message}</p>}

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
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm registration'}
          </button>

          <button
            className={styles.secondaryButton}
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setError(null);
              setMessage(null);
              setIsCodeStep(false);
            }}
          >
            Use another email
          </button>
        </form>
      )}
    </section>
  );
};

export default Registration;
