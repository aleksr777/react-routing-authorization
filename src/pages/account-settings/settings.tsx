import { Link } from 'react-router-dom';
import styles from './account-settings.module.css';

const Settings = () => {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.links}>
        <Link className={styles.link} to="/users/me/settings/password">
          Change password
        </Link>
        <Link className={styles.link} to="/users/me/settings/email">
          Change email
        </Link>
        <Link className={styles.dangerLink} to="/users/me/settings/delete">
          Delete profile
        </Link>
        <Link className={styles.link} to="/users/me">
          Back to profile
        </Link>
      </div>
    </section>
  );
};

export default Settings;
