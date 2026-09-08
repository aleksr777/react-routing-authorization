import { Link } from 'react-router-dom';
import type { AdminUser } from '../../features/admin/api/admin-api';
import styles from './user-management.module.css';

type UserManagementUserProps = {
  user: AdminUser;
};

const UserManagementUser = ({ user }: UserManagementUserProps) => {
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

      <Link className={styles.actionLink} to={`/admin/users/${user.id}`}>
        Manage user
      </Link>
    </li>
  );
};

export default UserManagementUser;
