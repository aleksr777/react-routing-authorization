import { type FormEvent } from 'react';
import styles from './password-reset.module.css';

type PasswordResetRequestFormProps = {
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const PasswordResetRequestForm = ({
  error,
  isSubmitting,
  onSubmit,
}: PasswordResetRequestFormProps) => {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label}>
        Email
        <input className={styles.input} name="email" type="email" autoComplete="email" required />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending code...' : 'Send reset code'}
      </button>
    </form>
  );
};

export default PasswordResetRequestForm;
