import type { AdminUser } from '../../features/admin/api/admin-api';
import styles from './user-management.module.css';

type UserManagementUserProps = {
  user: AdminUser;
  isBusy: boolean;
  onBlock: (id: number) => void;
  onUnblock: (id: number) => void;
  onDelete: (id: number) => void;
};

const UserManagementUser = ({
  user,
  isBusy,
  onBlock,
  onUnblock,
  onDelete,
}: UserManagementUserProps) => {
  const isAdministrator = user.role === 'admin';

  return (
    <li className={styles.userCard}>
      <div className={styles.userData}>
        <strong>{user.nickname ?? 'No nickname'}</strong>
        <span>ID: {user.id}</span>
        <span>Email: {user.email}</span>
        <span>Name: {user.name ?? '—'}</span>
        <span>Age: {user.age ?? '—'}</span>
        <span>Role: {user.role}</span>
        <span>Status: {user.is_blocked ? 'Blocked' : 'Active'}</span>
        {user.blocked_reason && <span>Block reason: {user.blocked_reason}</span>}
      </div>

      {isAdministrator ? (
        <span>Administrator account</span>
      ) : (
        <div className={styles.actions}>
          {user.is_blocked ? (
            <button type="button" disabled={isBusy} onClick={() => onUnblock(user.id)}>
              Unblock
            </button>
          ) : (
            <button type="button" disabled={isBusy} onClick={() => onBlock(user.id)}>
              Block
            </button>
          )}
          <button type="button" disabled={isBusy} onClick={() => onDelete(user.id)}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
};

export default UserManagementUser;
