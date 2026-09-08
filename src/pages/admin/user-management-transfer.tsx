import { useState } from 'react';
import type { AdminUser } from '../../features/admin/api/admin-api';
import styles from './user-management.module.css';

type UserManagementTransferProps = {
  user: AdminUser;
  isBusy: boolean;
  onTransfer: () => Promise<void>;
};

const UserManagementTransfer = ({ user, isBusy, onTransfer }: UserManagementTransferProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    await onTransfer();
    setIsConfirming(false);
  };

  if (isConfirming) {
    return (
      <div className={styles.confirmPanel}>
        <p>
          Transfer administrator rights to this user? After the user confirms the invitation, you
          will lose administrator rights.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleConfirm().catch(() => undefined)}
          >
            Send invitation
          </button>
          <button type="button" disabled={isBusy} onClick={() => setIsConfirming(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionSection}>
      <button
        type="button"
        disabled={isBusy || user.is_blocked || user.role === 'admin'}
        onClick={() => setIsConfirming(true)}
      >
        Transfer administrator rights
      </button>
      {user.is_blocked && <p>Blocked users cannot receive administrator rights.</p>}
    </div>
  );
};

export default UserManagementTransfer;
