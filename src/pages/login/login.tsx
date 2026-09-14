import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import { CredentialsForm, MfaForm } from './login-forms';
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
    if (!email || !password) return setError('Enter email and password');

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
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit authentication code');

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

  const backFromMfa = () => {
    setMfaChallenge(null);
    setError(null);
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>
      {mfaChallenge ? (
        <MfaForm
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleMfa}
          onBack={backFromMfa}
        />
      ) : (
        <CredentialsForm error={error} isSubmitting={isSubmitting} onSubmit={handleCredentials} />
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
