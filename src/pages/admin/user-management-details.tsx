import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  blockAdminUserRequest,
  cancelAdminTransferRequest,
  deleteAdminUserRequest,
  getAdminUserRequest,
  initiateAdminTransferRequest,
  type AdminUser,
  unblockAdminUserRequest,
} from '../../features/admin/api/admin-api';
import { useAdminTransferStatus } from '../../features/admin/model/use-admin-transfer-status';
import UserManagementActions from './user-management-actions';
import UserManagementTransfer from './user-management-transfer';
import UserManagementUserData from './user-management-user-data';
import styles from './user-management.module.css';

const UserManagementDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = Number(id);
  const {
    status: transferStatus,
    refresh: refreshTransferStatus,
    markPending,
  } = useAdminTransferStatus();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const loadUser = useCallback(async () => {
    if (!Number.isInteger(userId) || userId <= 0) {
      setError('Invalid user id');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setUser(await getAdminUserRequest(userId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      setError(null);
      setMessage(null);
      setIsBusy(true);
      await action();
      setMessage(successMessage);
      await loadUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'User action failed');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const handleBlock = (reason: string) =>
    runAction(() => blockAdminUserRequest(userId, reason), 'User blocked');
  const handleUnblock = () => runAction(() => unblockAdminUserRequest(userId), 'User unblocked');
  const handleTransfer = async (password: string) => {
    await runAction(
      () => initiateAdminTransferRequest(userId, password),
      'Administrator rights invitation sent.',
    );
    markPending(userId);
  };
  const handleCancelTransfer = async () => {
    await runAction(cancelAdminTransferRequest, 'Administrator rights transfer cancelled.');
    await refreshTransferStatus();
  };

  const handleDelete = async () => {
    try {
      setError(null);
      setIsBusy(true);
      await deleteAdminUserRequest(userId);
      navigate('/admin/users', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'User deletion failed');
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) return <p>Loading user...</p>;

  return (
    <section className={styles.wrapper}>
      <h2>User management</h2>

      {error && !user ? (
        <p className={styles.error}>{error}</p>
      ) : user ? (
        <>
          <div className={styles.userCard}>
            <UserManagementUserData user={user} />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p>{message}</p>}

          <UserManagementActions
            user={user}
            isBusy={isBusy}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onDelete={handleDelete}
          />
          <UserManagementTransfer
            user={user}
            isBusy={isBusy}
            transferStatus={transferStatus}
            onTransfer={handleTransfer}
            onCancel={handleCancelTransfer}
          />
        </>
      ) : null}

      <Link className={styles.actionLink} to="/admin/users">
        Back to user management
      </Link>
    </section>
  );
};

export default UserManagementDetails;
