import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import { getCurrentUserRequest, type CurrentUser } from '../../features/users/api/users-api';
import styles from './my-profile.module.css';

const MyProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUserRequest();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await logout();
      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>My profile</h1>

      <div className={styles.info}>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p>Nickname: {user.nickname}</p>
        <p>Role: {user.role}</p>
      </div>

      <button
        className={styles.logoutButton}
        type="button"
        onClick={handleLogout}
        disabled={isLogoutLoading}
      >
        {isLogoutLoading ? 'Signing out...' : 'Logout'}
      </button>
    </section>
  );
};

export default MyProfile;
