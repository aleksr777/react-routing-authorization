import { useState } from 'react';
import type { AdminUser } from '../../features/admin/api/admin-api';
import styles from './user-management.module.css';

type UserManagementActionsProps = {
  user: AdminUser;
  isBusy: boolean;
  onBlock: (reason: string) => Promise<void>;
  onUnblock: () => Promise<void>;
  onDelete: () => Promise<void>;
};

const UserManagementActions = ({
  user,
  isBusy,
  onBlock,
  onUnblock,
  onDelete,
}: UserManagementActionsProps) => {
  const [isBlockConfirming, setIsBlockConfirming] = useState(false);
  const [isUnblockConfirming, setIsUnblockConfirming] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  if (user.role === 'admin') {
    return <p>Administrator account cannot be blocked or deleted.</p>;
  }

  const handleConfirmBlock = async () => {
    await onBlock(blockReason);
    setBlockReason('');
    setIsBlockConfirming(false);
  };

  const handleConfirmUnblock = async () => {
    await onUnblock();
    setIsUnblockConfirming(false);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setIsDeleteConfirming(false);
  };

  return (
    <div className={styles.actionSection}>
      {user.is_blocked ? (
        isUnblockConfirming ? (
          <div className={styles.confirmPanel}>
            <p>Confirm unblocking this user?</p>
            <div className={styles.actions}>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleConfirmUnblock().catch(() => undefined)}
              >
                Confirm unblock
              </button>
              <button type="button" disabled={isBusy} onClick={() => setIsUnblockConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isBusy || isDeleteConfirming}
            onClick={() => setIsUnblockConfirming(true)}
          >
            Unblock user
          </button>
        )
      ) : isBlockConfirming ? (
        <div className={styles.confirmPanel}>
          <label className={styles.reasonField}>
            Block reason (optional)
            <input
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              maxLength={255}
            />
          </label>
          <p>Confirm blocking this user?</p>
          <div className={styles.actions}>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleConfirmBlock().catch(() => undefined)}
            >
              Confirm block
            </button>
            <button type="button" disabled={isBusy} onClick={() => setIsBlockConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isBusy || isDeleteConfirming}
          onClick={() => setIsBlockConfirming(true)}
        >
          Block user
        </button>
      )}

      {isDeleteConfirming ? (
        <div className={styles.confirmPanel}>
          <p>Delete this user permanently?</p>
          <div className={styles.actions}>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleConfirmDelete().catch(() => undefined)}
            >
              Confirm delete
            </button>
            <button type="button" disabled={isBusy} onClick={() => setIsDeleteConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isBusy || isBlockConfirming || isUnblockConfirming}
          onClick={() => setIsDeleteConfirming(true)}
        >
          Delete user
        </button>
      )}
    </div>
  );
};

export default UserManagementActions;
