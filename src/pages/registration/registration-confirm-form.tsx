import type { FormEventHandler } from 'react';
import styles from './registration.module.css';

type RegistrationConfirmFormProps = {
  message: string | null;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onUseAnotherEmail: () => void;
};

const RegistrationConfirmForm = ({
  message,
  error,
  isSubmitting,
  onSubmit,
  onUseAnotherEmail,
}: RegistrationConfirmFormProps) => {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {message && <p className={styles.message}>{message}</p>}

      <label className={styles.label}>
        Confirmation code
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

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Confirming...' : 'Confirm registration'}
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

export default RegistrationConfirmForm;
