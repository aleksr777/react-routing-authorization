import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import { deleteCurrentUserRequest } from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const DeleteProfile = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Delete profile</h1>
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

      <Link className={styles.link} to="/users/me/settings">
        Back to settings
      </Link>
    </section>
  );
};

export default DeleteProfile;
