import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import {
  deleteCurrentUserRequest,
  getCurrentUserRequest,
} from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const DeleteProfile = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      try {
        const user = await getCurrentUserRequest();
        if (isMounted) setIsAdmin(user.role === 'admin');
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') ?? '');

    try {
      setError(null);
      setIsSubmitting(true);
      await deleteCurrentUserRequest(password);
      clearSession();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profile deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin === null && !error) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Delete profile</h1>

      {isAdmin ? (
        <p className={styles.warning}>Administrator profile cannot be deleted.</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <p className={styles.warning}>This action is permanent and cannot be undone.</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Current password
              <input
                className={styles.input}
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                maxLength={100}
                required
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.dangerButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete profile'}
            </button>
          </form>
        </>
      )}

      <Link className={styles.link} to="/users/me/settings">
        Back to settings
      </Link>
    </section>
  );
};

export default DeleteProfile;
