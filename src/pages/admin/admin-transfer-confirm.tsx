import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmAdminTransferRequest } from '../../features/admin/api/admin-api';
import styles from './admin-transfer-confirm.module.css';

const AdminTransferConfirm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmAdminTransferRequest(code);
      navigate('/admin/users', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Administrator rights transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Administrator rights transfer</h2>
      <p>Enter the 6-digit code from the administrator rights invitation email.</p>

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
