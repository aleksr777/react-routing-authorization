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
          <Link className={styles.link} to="/about">
            <p className={styles.linkText}>About Us</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
