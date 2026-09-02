import type { FormEventHandler } from 'react';
import styles from './registration.module.css';

type RegistrationRequestFormProps = {
  error: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const RegistrationRequestForm = ({
  error,
  isSubmitting,
  onSubmit,
}: RegistrationRequestFormProps) => {
  return (
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
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          required
        />
      </label>

      <label className={styles.label}>
        Repeat password
        <input
          className={styles.input}
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={100}
          required
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending code...' : 'Create account'}
      </button>
    </form>
  );
};

export default RegistrationRequestForm;
