import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  confirmPasswordChange,
  requestPasswordChange,
} from '../../features/users/api/account-settings-api';
import PasswordCurrentForm from './password-current-form';
import PasswordNewForm from './password-new-form';
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

      {code ? (
        <PasswordNewForm
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleChangePassword}
        />
      ) : (
        <PasswordCurrentForm
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleVerifyOldPassword}
        />
      )}
    </section>
  );
};

export default ChangePassword;
