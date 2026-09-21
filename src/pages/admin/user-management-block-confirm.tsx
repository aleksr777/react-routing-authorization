import { useState, type FormEvent } from 'react';
import ConfirmationInput from '../../components/confirmation-input/confirmation-input';
import { ModalDismissButton } from '../../components/modal/modal';
import styles from './user-management.module.css';

type Props = {
  isBusy: boolean;
  unblock?: boolean;
  onConfirm: (reason: string) => Promise<void>;
};

const UserManagementBlockConfirm = ({ isBusy, unblock = false, onConfirm }: Props) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;
    try {
      setError(null);
      await onConfirm(reason);
      setReason('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };
  return (
    <form className={styles.confirmPanel} autoComplete="off" onSubmit={handleConfirm}>
      <p>
        {unblock
          ? 'Restore access to this account?'
          : 'Block this account and end all its active sessions?'}
      </p>
      {!unblock && (
        <label className={styles.reasonField}>
          Block reason (optional)
          <ConfirmationInput
            value={reason}
            maxLength={255}
            disabled={isBusy}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button type="submit" disabled={isBusy}>
          {isBusy ? 'Please wait...' : unblock ? 'Confirm unblock' : 'Confirm block'}
        </button>
        <ModalDismissButton disabled={isBusy}>Cancel</ModalDismissButton>
      </div>
    </form>
  );
};
export default UserManagementBlockConfirm;
