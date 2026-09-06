import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import styles from './header.module.css';

type NavigationItemProps = {
  to: string;
  label: string;
  currentPath: string;
};

const NavigationItem = ({ to, label, currentPath }: NavigationItemProps) => (
  <li className={styles.li}>
    {currentPath === to ? (
      <span className={styles.currentLink}>{label}</span>
    ) : (
      <Link className={styles.link} to={to}>
        <span className={styles.linkText}>{label}</span>
      </Link>
    )}
  </li>
);

const Header = () => {
  const { isAuth, isInitializing } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        <NavigationItem to="/" label="Home" currentPath={pathname} />

        {!isInitializing && !isAuth && (
          <>
            <NavigationItem to="/auth/login" label="Login" currentPath={pathname} />
            <NavigationItem
              to="/auth/registration"
              label="Registration"
              currentPath={pathname}
            />
          </>
        )}

        {!isInitializing && isAuth && (
          <NavigationItem to="/users/me" label="My profile" currentPath={pathname} />
        )}
      </ul>
    </nav>
  );
};

export default Header;
