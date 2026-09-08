import { useState } from 'react';
import type { AdminTransferStatus, AdminUser } from '../../features/admin/api/admin-api';
import UserManagementTransferInitiate from './user-management-transfer-initiate';
import styles from './user-management.module.css';

type UserManagementTransferProps = {
  user: AdminUser;
  isBusy: boolean;
  transferStatus: AdminTransferStatus;
  onTransfer: (password: string) => Promise<void>;
  onCancel: () => Promise<void>;
};

const UserManagementTransfer = ({
  user,
  isBusy,
  transferStatus,
  onTransfer,
  onCancel,
}: UserManagementTransferProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelConfirming, setIsCancelConfirming] = useState(false);

  const handleTransfer = async (password: string) => {
    await onTransfer(password);
    setIsConfirming(false);
  };

  const handleCancel = async () => {
    await onCancel();
    setIsCancelConfirming(false);
  };

  if (transferStatus.pending) {
    const isCurrentTarget = transferStatus.target_user_id === user.id;

    if (!isCurrentTarget) {
      return (
        <div className={styles.actionSection}>
          <button type="button" disabled>
            Transfer administrator rights
          </button>
          <p>Another administrator rights transfer is awaiting confirmation.</p>
        </div>
      );
    }

    if (isCancelConfirming) {
      return (
        <div className={styles.confirmPanel}>
          <p>Cancel the pending administrator rights transfer?</p>
          <p>The invitation code will become invalid immediately.</p>
          <div className={styles.actions}>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleCancel().catch(() => undefined)}
            >
              Confirm cancellation
            </button>
            <button type="button" disabled={isBusy} onClick={() => setIsCancelConfirming(false)}>
              Keep transfer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.actionSection}>
        <button type="button" disabled={isBusy} onClick={() => setIsCancelConfirming(true)}>
          Cancel administrator rights transfer
        </button>
        <p>Administrator rights invitation is awaiting this user’s confirmation.</p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <UserManagementTransferInitiate
        isBusy={isBusy}
        onConfirm={handleTransfer}
        onCancel={() => setIsConfirming(false)}
      />
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
