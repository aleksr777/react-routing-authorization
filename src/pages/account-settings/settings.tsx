import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUserRequest } from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const Settings = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      try {
        const user = await getCurrentUserRequest();
        if (isMounted) setIsAdmin(user.role === 'admin');
      } catch {
        if (isMounted) setIsAdmin(null);
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Settings</h2>

      <div className={styles.links}>
        <Link className={styles.link} to="/users/me/settings/profile">
          Edit profile
        </Link>
        <Link className={styles.link} to="/users/me/settings/password">
          Change password
        </Link>
        <Link className={styles.link} to="/users/me/settings/email">
          Change email
        </Link>
        {isAdmin === false && (
          <Link className={styles.dangerLink} to="/users/me/settings/delete">
            Delete profile
          </Link>
        )}
        <Link className={styles.link} to="/users/me">
          Back to profile
        </Link>
      </div>
    </section>
  );
};

export default Settings;
