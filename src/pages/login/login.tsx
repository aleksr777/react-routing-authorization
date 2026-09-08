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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      const status = await login(email, password);
      navigate(status === 'blocked' ? '/blocked' : redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
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

      <Link className={styles.link} to="/auth/password-reset">
        Forgot password?
      </Link>
      <Link className={styles.link} to="/auth/registration">
        Registration
      </Link>
    </section>
  );
};

export default Login;
