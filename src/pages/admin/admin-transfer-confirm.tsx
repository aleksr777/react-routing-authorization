import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmAdminTransferRequest } from '../../features/admin/api/admin-api';
import { getAttemptsRemaining } from '../../shared/api/api-client';
import styles from './admin-transfer-confirm.module.css';

const AdminTransferConfirm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setError('Enter your current password');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmAdminTransferRequest(code, password);
      navigate('/admin/users', { replace: true });
    } catch (err: unknown) {
      const remaining = getAttemptsRemaining(err);
      if (remaining !== null) setAttemptsRemaining(remaining);
      setError(err instanceof Error ? err.message : 'Administrator rights transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Administrator rights transfer</h2>
      <p>Enter the 6-digit code from the invitation email and your current password.</p>
      <p>Maximum 3 incorrect code attempts. The pending transfer is cancelled on the third.</p>
      {attemptsRemaining !== null && <p>Attempts remaining: {attemptsRemaining}.</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Confirmation code
          <input
            className={styles.input}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
        </label>

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

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Confirming...' : 'Accept administrator rights'}
        </button>
      </form>

      <Link to="/users/me">Back to profile</Link>
    </section>
  );
};

export default AdminTransferConfirm;
