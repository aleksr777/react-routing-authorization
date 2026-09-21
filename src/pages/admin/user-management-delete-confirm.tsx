import { useState, type FormEvent } from 'react';
import ConfirmationInput from '../../components/confirmation-input/confirmation-input';
import { ModalDismissButton } from '../../components/modal/modal';
import styles from './user-management.module.css';

type Props = { isBusy: boolean; onConfirm: (password: string) => Promise<void> };

const UserManagementDeleteConfirm = ({ isBusy, onConfirm }: Props) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || password.length < 8 || password.length > 100) return;
    try {
      setError(null);
      await onConfirm(password);
      setPassword('');
    } catch (err: unknown) {
      setPassword('');
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };
  return (
    <form className={styles.confirmPanel} autoComplete="off" onSubmit={handleConfirm}>
      <p>Delete this user permanently? This action cannot be undone.</p>
      <label className={styles.reasonField}>
        Current administrator password
        <ConfirmationInput
          type="password"
          value={password}
          minLength={8}
          maxLength={100}
          required
          disabled={isBusy}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button type="submit" disabled={isBusy || password.length < 8 || password.length > 100}>
          {isBusy ? 'Deleting...' : 'Confirm delete'}
        </button>
        <ModalDismissButton disabled={isBusy}>Cancel</ModalDismissButton>
      </div>
    </form>
  );
};
export default UserManagementDeleteConfirm;
