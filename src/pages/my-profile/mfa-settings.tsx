import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  beginMfaSetupRequest,
  disableMfaRequest,
  enableMfaRequest,
  getMfaStatusRequest,
  type MfaSetup,
} from '../../features/auth/api/auth-api';
import { MfaDisableForm, MfaSetupForm } from './mfa-settings-forms';
import styles from './mfa-settings.module.css';

const MfaSettings = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getMfaStatusRequest()
      .then((result) => {
        if (mounted) setEnabled(result.enabled);
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load MFA status');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const beginSetup = async () => {
    try {
      setError(null);
      setMessage(null);
      setIsBusy(true);
      setSetup(await beginMfaSetupRequest());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start MFA setup');
    } finally {
      setIsBusy(false);
    }
  };

  const enable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    try {
      setError(null);
      setIsBusy(true);
      const result = await enableMfaRequest(code);
      setEnabled(result.enabled);
      setSetup(null);
      setMessage('Two-factor authentication is enabled. Other sessions were terminated.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to enable MFA');
    } finally {
      setIsBusy(false);
    }
  };

  const disable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const code = String(data.get('code') ?? '').trim();
    try {
      setError(null);
      setIsBusy(true);
      const result = await disableMfaRequest(password, code);
      setEnabled(result.enabled);
      setMessage('Two-factor authentication is disabled. Other sessions were terminated.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setIsBusy(false);
    }
  };

  if (enabled === null && !error) return <p>Loading MFA settings...</p>;

  return (
    <section className={styles.wrapper}>
      <h2>Two-factor authentication</h2>
      <p>Status: {enabled ? 'Enabled' : 'Disabled'}</p>
      {message && <p>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!enabled && !setup && (
        <button type="button" onClick={() => void beginSetup()} disabled={isBusy}>
          Set up authenticator app
        </button>
      )}
      {!enabled && setup && <MfaSetupForm setup={setup} isBusy={isBusy} onSubmit={enable} />}
      {enabled && <MfaDisableForm isBusy={isBusy} onSubmit={disable} />}
      <Link to="/users/me">Back to profile</Link>
    </section>
  );
};

export default MfaSettings;
