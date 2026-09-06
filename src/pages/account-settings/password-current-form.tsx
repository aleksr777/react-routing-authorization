import type { FormEventHandler } from 'react';
import styles from './account-settings.module.css';

type PasswordCurrentFormProps = {
  error: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const PasswordCurrentForm = ({ error, isSubmitting, onSubmit }: PasswordCurrentFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
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
);

export default PasswordCurrentForm;
