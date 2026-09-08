import { useState } from 'react';
import type { AdminTransferStatus, AdminUser } from '../../features/admin/api/admin-api';
import styles from './user-management.module.css';

type UserManagementTransferProps = {
  user: AdminUser;
  isBusy: boolean;
  transferStatus: AdminTransferStatus;
  onTransfer: () => Promise<void>;
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

  const handleConfirm = async () => {
    await onTransfer();
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
