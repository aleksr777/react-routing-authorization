import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import styles from './login.module.css';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const Login = () => {
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/';

  const handleCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      setError('Enter email and password');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const outcome = await login(email, password);
      if (outcome.status === 'blocked') {
        navigate('/blocked', {
          replace: true,
          state: { blockedInfo: outcome.info },
        });
        return;
      }
      if (outcome.status === 'mfa_required') {
        setMfaChallenge(outcome.challenge);
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mfaChallenge) return;
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit authentication code');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await verifyMfa(mfaChallenge, code);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>

      {mfaChallenge ? (
        <form className={styles.form} onSubmit={handleMfa}>
          <label className={styles.label}>
            Authentication code
            <input
              className={styles.input}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
          <button
            className={styles.button}
            type="button"
            onClick={() => {
              setMfaChallenge(null);
              setError(null);
            }}
            disabled={isSubmitting}
          >
            Back
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleCredentials}>
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
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}

      {!mfaChallenge && (
        <>
          <Link className={styles.link} to="/auth/password-reset">
            Forgot password?
          </Link>
          <Link className={styles.link} to="/auth/registration">
            Registration
          </Link>
        </>
      )}
    </section>
  );
};

export default Login;
