import type { FormEventHandler } from 'react';
import styles from './login.module.css';

type FormStateProps = {
  error: string | null;
  isSubmitting: boolean;
};

type CredentialsFormProps = FormStateProps & {
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const CredentialsForm = ({ error, isSubmitting, onSubmit }: CredentialsFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label className={styles.label}>
      Email
      <input className={styles.input} name="email" type="email" autoComplete="email" required />
    </label>

    <label className={styles.label}>
      Password
      <input
        className={styles.input}
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
    </label>

    {error && <p className={styles.error}>{error}</p>}
    <button className={styles.button} type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Signing in...' : 'Sign in'}
    </button>
  </form>
);

type MfaFormProps = FormStateProps & {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBack: () => void;
};

export const MfaForm = ({ error, isSubmitting, onSubmit, onBack }: MfaFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label className={styles.label}>
      Authentication code
      <input
        className={styles.input}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoFocus
      />
    </label>
    {error && <p className={styles.error}>{error}</p>}
    <button className={styles.button} type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Verifying...' : 'Verify'}
    </button>
    <button className={styles.button} type="button" onClick={onBack} disabled={isSubmitting}>
      Back
    </button>
  </form>
);
