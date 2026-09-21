import type { AdminUser } from '../../features/admin/api/admin-api';
import styles from '../my-profile/active-sessions.module.css';

type Props = {
  user: AdminUser | null;
  isRevokingAll: boolean;
  revokingCount: number;
  sessionCount: number;
  onRevokeAll: () => void;
};

const UserManagementSessionsHeader = ({
  user,
  isRevokingAll,
  revokingCount,
  sessionCount,
  onRevokeAll,
}: Props) => (
  <div className={styles.header}>
    <div>
      <h2 className={styles.title}>Active sessions</h2>
      {user && <p>User: {user.email}</p>}
    </div>
    <button
      className={styles.terminateAllButton}
      type="button"
      onClick={onRevokeAll}
      disabled={isRevokingAll || revokingCount > 0 || sessionCount === 0}
    >
      {isRevokingAll ? 'Terminating...' : 'Terminate all sessions'}
    </button>
  </div>
);

export default UserManagementSessionsHeader;
