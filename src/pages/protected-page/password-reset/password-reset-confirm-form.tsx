import { type FormEvent } from 'react';
import styles from './password-reset.module.css';

type PasswordResetConfirmFormProps = {
  message: string | null;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUseAnotherEmail: () => void;
};

const PasswordResetConfirmForm = ({
  message,
  error,
  isSubmitting,
  onSubmit,
  onUseAnotherEmail,
}: PasswordResetConfirmFormProps) => {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {message && <p className={styles.message}>{message}</p>}

      <label className={styles.label}>
        Reset code
        <input
          className={styles.input}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
      </label>

      <label className={styles.label}>
        New password
        <input
          className={styles.input}
          name="newPassword"
          type="password"
          autoComplete="new-password"
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
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          required
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Resetting password...' : 'Reset password'}
      </button>

      <button
        className={styles.secondaryButton}
        type="button"
        disabled={isSubmitting}
        onClick={onUseAnotherEmail}
      >
        Use another email
      </button>
    </form>
  );
};

export default PasswordResetConfirmForm;
