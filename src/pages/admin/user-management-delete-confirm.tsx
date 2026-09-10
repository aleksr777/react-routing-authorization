import { useState } from 'react';
import styles from './user-management.module.css';

type UserManagementDeleteConfirmProps = {
  isBusy: boolean;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
};

const UserManagementDeleteConfirm = ({
  isBusy,
  onConfirm,
  onCancel,
}: UserManagementDeleteConfirmProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(password);
      setPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div className={styles.confirmPanel}>
      <p>Delete this user permanently?</p>
      <label className={styles.reasonField}>
        Current administrator password
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          minLength={8}
          maxLength={100}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
      </label>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={isBusy || password.length < 8 || password.length > 100}
          onClick={() => void handleConfirm()}
        >
          Confirm delete
        </button>
        <button type="button" disabled={isBusy} onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default UserManagementDeleteConfirm;
