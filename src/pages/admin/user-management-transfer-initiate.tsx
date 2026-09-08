import { useState } from 'react';
import styles from './user-management.module.css';

type UserManagementTransferInitiateProps = {
  isBusy: boolean;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
};

const UserManagementTransferInitiate = ({
  isBusy,
  onConfirm,
  onCancel,
}: UserManagementTransferInitiateProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(password);
      setPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Administrator rights transfer failed');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError(null);
  };

  return (
    <div className={styles.confirmPanel}>
      <p>
        Transfer administrator rights to this user? After the user confirms the invitation, you
        will lose administrator rights.
      </p>
      <label className={styles.reasonField}>
        Current administrator password
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          minLength={8}
          maxLength={100}
          onChange={(event) => handlePasswordChange(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={isBusy || password.length < 8 || password.length > 100}
          onClick={() => void handleConfirm()}
        >
          Send invitation
        </button>
        <button type="button" disabled={isBusy} onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default UserManagementTransferInitiate;
