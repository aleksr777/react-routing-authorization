import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import {
  createAuthReturnState,
  getAuthReturnTo,
} from '../../features/auth/model/auth-return-location';
import AuthModalShell from '../auth-modal/auth-modal-shell';
import { CredentialsForm } from './login-forms';
import styles from './login.module.css';
import type { AdminLoginChallenge } from '../../features/auth/api/auth-api';
import AdminLoginConfirm from './admin-login-confirm';

type LocationState = {
  from?: {
    pathname?: string;
  };
  message?: string;
};

const Login = () => {
  const { isAuth, isInitializing, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<AdminLoginChallenge | null>(null);

  const state = location.state as LocationState | null;
  const redirectTo = getAuthReturnTo(location.state);
  const authLinkState = createAuthReturnState(location);

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
      if (outcome.status === 'admin-confirmation') {
        setChallenge(outcome.challenge);
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to={redirectTo} replace />;

  if (challenge)
    return (
      <AuthModalShell title="Confirm administrator sign-in">
        <AdminLoginConfirm
          key={challenge.challenge_id}
          challenge={challenge}
          onChallenge={setChallenge}
          onConfirmed={() => navigate(redirectTo, { replace: true })}
          onBack={() => {
            setChallenge(null);
            setError(null);
          }}
        />
      </AuthModalShell>
    );

  return (
    <AuthModalShell title="Login">
      <section className={styles.wrapper}>
        {state?.message && <p>{state.message}</p>}
        <CredentialsForm error={error} isSubmitting={isSubmitting} onSubmit={handleCredentials} />
        <Link className={styles.link} to="/auth/password-reset" state={authLinkState}>
          Forgot password?
        </Link>
        <Link className={styles.link} to="/auth/registration" state={authLinkState}>
          Registration
        </Link>
      </section>
    </AuthModalShell>
  );
};

export default Login;
