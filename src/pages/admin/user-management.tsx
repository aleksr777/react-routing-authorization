import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { getAdminUsersRequest, type AdminUser } from '../../features/admin/api/admin-api';
import UserManagementUser from './user-management-user';
import styles from './user-management.module.css';

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    void loadUsers(search);
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

      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p>Loading users...</p>}
      {!isLoading && users.length === 0 && <p>No users found.</p>}

      <ul className={styles.userList}>
        {users.map((user) => (
          <UserManagementUser key={user.id} user={user} />
        ))}
      </ul>
    </section>
  );
};

export default UserManagement;
