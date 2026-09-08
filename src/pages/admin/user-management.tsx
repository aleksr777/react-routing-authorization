import { type FormEvent, useCallback, useEffect, useState } from 'react';
import {
  blockAdminUserRequest,
  deleteAdminUserRequest,
  getAdminUsersRequest,
  type AdminUser,
  unblockAdminUserRequest,
} from '../../features/admin/api/admin-api';
import UserManagementUser from './user-management-user';
import styles from './user-management.module.css';

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const loadUsers = useCallback(async (query: string) => {
    try {
      setError(null);
      setIsLoading(true);
      setUsers(await getAdminUsersRequest(query));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers('');
  }, [loadUsers]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    void loadUsers(search);
  };

  const runUserAction = async (
    userId: number,
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    try {
      setError(null);
      setMessage(null);
      setBusyUserId(userId);
      await action();
      setMessage(successMessage);
      await loadUsers(search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'User action failed');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleBlock = (userId: number) => {
    void runUserAction(
      userId,
      () => blockAdminUserRequest(userId, blockReason),
      'User blocked',
    );
  };

  const handleUnblock = (userId: number) => {
    void runUserAction(userId, () => unblockAdminUserRequest(userId), 'User unblocked');
  };

  const handleDelete = (userId: number) => {
    if (!window.confirm('Delete this user permanently?')) return;
    void runUserAction(userId, () => deleteAdminUserRequest(userId), 'User deleted');
  };

  return (
    <section className={styles.wrapper}>
      <h1>User management</h1>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by nickname, email or phone"
        />
        <button type="submit" disabled={isLoading}>
          Search
        </button>
      </form>

      <label className={styles.reasonField}>
        Block reason (optional)
        <input
          value={blockReason}
          onChange={(event) => setBlockReason(event.target.value)}
          maxLength={255}
        />
      </label>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p>{message}</p>}
      {isLoading && <p>Loading users...</p>}

      {!isLoading && users.length === 0 && <p>No users found.</p>}

      <ul className={styles.userList}>
        {users.map((user) => (
          <UserManagementUser
            key={user.id}
            user={user}
            isBusy={busyUserId === user.id}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </section>
  );
};

export default UserManagement;
