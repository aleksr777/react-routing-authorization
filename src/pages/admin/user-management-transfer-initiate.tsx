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

  const handleConfirm = async () => {
    await onConfirm(password);
    setPassword('');
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
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={isBusy || password.length < 8 || password.length > 100}
          onClick={() => void handleConfirm().catch(() => undefined)}
        >
          Send invitation
        </button>
        <button type="button" disabled={isBusy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UserManagementTransferInitiate;
