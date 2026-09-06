import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmPasswordChange,
  requestPasswordChange,
} from '../../features/users/api/account-settings-api';
import styles from './account-settings.module.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyOldPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const oldPassword = String(new FormData(event.currentTarget).get('oldPassword') ?? '');

    try {
      setError(null);
      setIsSubmitting(true);
      const response = await requestPasswordChange(oldPassword);
      setCode(response.code);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code) return;

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get('newPassword') ?? '');
    const newPasswordConfirm = String(formData.get('newPasswordConfirm') ?? '');

    if (newPassword.length < 8 || newPassword.length > 100) {
      setError('Password must contain from 8 to 100 characters');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmPasswordChange(code, newPassword);
      navigate('/users/me/settings', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Change password</h1>

      {!code ? (
        <form className={styles.form} onSubmit={handleVerifyOldPassword}>
          <label className={styles.label}>
            Current password
            <input
              className={styles.input}
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              minLength={8}
              maxLength={100}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleChangePassword}>
          <label className={styles.label}>
            New password
            <input
              className={styles.input}
              name="newPassword"
              type="password"
              minLength={8}
              maxLength={100}
              required
            />
          </label>
          <label className={styles.label}>
            Repeat new password
            <input
              className={styles.input}
              name="newPasswordConfirm"
              type="password"
              minLength={8}
              maxLength={100}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Change password'}
          </button>
        </form>
      )}
    </section>
  );
};

export default ChangePassword;
