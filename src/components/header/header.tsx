import styles from './header.module.css';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <Link className={styles.link} to="/">
            <p className={styles.linkText}>Home</p>
          </Link>
        </li>
        <li>
          <Link className={styles.link} to="/auth/login">
            <p className={styles.linkText}>Login</p>
          </Link>
        </li>
        <li>
          <Link className={styles.link} to="/auth/logout">
            <p className={styles.linkText}>Logout</p>
          </Link>
        </li>
        <li>
          <Link className={styles.link} to="/users/me">
            <p className={styles.linkText}>My profile</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
