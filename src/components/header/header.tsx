import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import styles from './header.module.css';

const Header = () => {
  const { isAuth } = useAuth();

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <Link className={styles.link} to="/">
            <span className={styles.linkText}>Home</span>
          </Link>
        </li>

        {!isAuth && (
          <li className={styles.li}>
            <Link className={styles.link} to="/auth/login">
              <span className={styles.linkText}>Login</span>
            </Link>
          </li>
        )}

        {isAuth && (
          <>
            <li className={styles.li}>
              <Link className={styles.link} to="/users/me">
                <span className={styles.linkText}>My profile</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
