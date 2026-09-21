import { useState } from 'react';
import Modal from '../../components/modal/modal';
import type { AdminUser } from '../../features/admin/api/admin-api';
import UserManagementBlockConfirm from './user-management-block-confirm';
import UserManagementDeleteConfirm from './user-management-delete-confirm';
import styles from './user-management.module.css';

type Props = {
  user: AdminUser;
  isBusy: boolean;
  onBlock: (reason: string) => Promise<void>;
  onUnblock: () => Promise<void>;
  onDelete: (password: string) => Promise<void>;
};

const UserManagementActions = ({ user, isBusy, onBlock, onUnblock, onDelete }: Props) => {
  const [action, setAction] = useState<'block' | 'unblock' | 'delete' | null>(null);
  if (user.role === 'admin') return <p>Administrator account cannot be blocked or deleted.</p>;
  const confirmBlock = async (reason: string) => {
    if (action === 'unblock') await onUnblock();
    else await onBlock(reason);
    setAction(null);
  };
  const confirmDelete = async (password: string) => {
    await onDelete(password);
    setAction(null);
  };
  return (
    <div className={styles.actionSection}>
      <button
        type="button"
        disabled={isBusy || action !== null}
        onClick={() => setAction(user.is_blocked ? 'unblock' : 'block')}
      >
        {user.is_blocked ? 'Unblock user' : 'Block user'}
      </button>
      <button
        type="button"
        disabled={isBusy || action !== null}
        onClick={() => setAction('delete')}
      >
        Delete user
      </button>
      {action && (
        <Modal
          title={
            action === 'delete'
              ? 'Delete account'
              : action === 'block'
                ? 'Block account'
                : 'Unblock account'
          }
          onClose={() => setAction(null)}
          dismissible={!isBusy}
        >
          <p className={styles.confirmTarget}>{user.email}</p>
          {action === 'delete' ? (
            <UserManagementDeleteConfirm isBusy={isBusy} onConfirm={confirmDelete} />
          ) : (
            <UserManagementBlockConfirm
              isBusy={isBusy}
              unblock={action === 'unblock'}
              onConfirm={confirmBlock}
            />
          )}
        </Modal>
      )}
    </div>
  );
};
export default UserManagementActions;
