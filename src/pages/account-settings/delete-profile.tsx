import { type FormEvent, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Modal, { ModalDismissButton } from '../../components/modal/modal';
import ConfirmationInput from '../../components/confirmation-input/confirmation-input';
import { useAuth } from '../../features/auth/model/use-auth';
import { deleteCurrentUserRequest, type CurrentUser } from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const DeleteProfile = () => {
  const user = useOutletContext<CurrentUser>();
  const { endSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const isAdmin = user.role === 'admin';
  const passwordValid = password.length >= 8 && password.length <= 100;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isAdmin || !passwordValid) return;
    try {
      setError(null);
      setIsSubmitting(true);
      await deleteCurrentUserRequest(password);
      setPassword('');
      endSession();
    } catch (err: unknown) {
      setPassword('');
      setError(err instanceof Error ? err.message : 'Profile deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Delete your account"
      dismissible={!isSubmitting}
      onClose={() => navigate('/users/me', { replace: true })}
    >
      {isAdmin ? (
        <p className={styles.warning}>Administrator profile cannot be deleted.</p>
      ) : (
        <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
          <p className={styles.warning}>This action is permanent and cannot be undone.</p>
          <p>Enter your current password to delete your account.</p>
          <label className={styles.label}>
            Current password
            <ConfirmationInput
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              minLength={8}
              maxLength={100}
              required
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button
            className={styles.dangerButton}
            type="submit"
            disabled={isSubmitting || !passwordValid}
          >
            {isSubmitting ? 'Deleting...' : 'Confirm deletion'}
          </button>
          <ModalDismissButton className={styles.secondaryButton} disabled={isSubmitting}>
            Cancel
          </ModalDismissButton>
        </form>
      )}
    </Modal>
  );
};

export default DeleteProfile;
