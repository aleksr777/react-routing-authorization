import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal, { ModalDismissButton } from '../../components/modal/modal';
import ConfirmationInput from '../../components/confirmation-input/confirmation-input';
import {
  deleteCurrentUserRequest,
  getCurrentUserRequest,
} from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const DeleteProfile = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      try {
        const user = await getCurrentUserRequest();
        if (isMounted) setIsAdmin(user.role === 'admin');
      } catch (err: unknown) {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load user');
        }
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      await deleteCurrentUserRequest(password);
      window.location.replace('/');
    } catch (err: unknown) {
      setPassword('');
      setSubmitError(err instanceof Error ? err.message : 'Profile deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin === null && !loadError) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Delete profile</h2>

      {isAdmin ? (
        <p className={styles.warning}>Administrator profile cannot be deleted.</p>
      ) : loadError ? (
        <p className={styles.error}>{loadError}</p>
      ) : (
        <>
          <p className={styles.warning}>This action is permanent and cannot be undone.</p>
          <button
            className={styles.dangerButton}
            type="button"
            onClick={() => setIsConfirming(true)}
          >
            Delete profile
          </button>
          {isConfirming && (
            <Modal
              title="Delete your account"
              dismissible={!isSubmitting}
              onClose={() => {
                setIsConfirming(false);
                setPassword('');
                setSubmitError(null);
              }}
            >
              <p>This action is permanent and cannot be undone.</p>
              <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
                <label className={styles.label}>
                  Current password
                  <ConfirmationInput
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    minLength={8}
                    maxLength={100}
                    required
                  />
                </label>

                {submitError && <p className={styles.error}>{submitError}</p>}

                <button
                  className={styles.dangerButton}
                  type="submit"
                  disabled={isSubmitting || password.length < 8 || password.length > 100}
                >
                  {isSubmitting ? 'Deleting...' : 'Confirm deletion'}
                </button>
                <ModalDismissButton className={styles.button} disabled={isSubmitting}>
                  Cancel
                </ModalDismissButton>
              </form>
            </Modal>
          )}
        </>
      )}

      <Link className={styles.link} to="/users/me">
        Back to profile
      </Link>
    </section>
  );
};

export default DeleteProfile;
