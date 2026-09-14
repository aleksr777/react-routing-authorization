import type { FormEventHandler } from 'react';
import type { MfaSetup } from '../../features/auth/api/auth-api';
import styles from './mfa-settings.module.css';

type MfaSetupFormProps = {
  setup: MfaSetup;
  isBusy: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const MfaSetupForm = ({ setup, isBusy, onSubmit }: MfaSetupFormProps) => (
  <div className={styles.setup}>
    <p>Enter this secret in your authenticator app:</p>
    <code className={styles.secret}>{setup.secret}</code>
    <a href={setup.otpauth_uri}>Open in authenticator app</a>
    <p>The setup expires in {Math.ceil(setup.expires_in / 60)} minutes.</p>
    <form className={styles.form} onSubmit={onSubmit}>
      <label>
        Authentication code
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
      </label>
      <button type="submit" disabled={isBusy}>
        Enable MFA
      </button>
    </form>
  </div>
);

type MfaDisableFormProps = {
  isBusy: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const MfaDisableForm = ({ isBusy, onSubmit }: MfaDisableFormProps) => (
  <form className={styles.form} onSubmit={onSubmit}>
    <label>
      Current password
      <input name="password" type="password" autoComplete="current-password" required />
    </label>
    <label>
      Authentication code
      <input
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
      />
    </label>
    <button type="submit" disabled={isBusy}>
      Disable MFA
    </button>
  </form>
);
