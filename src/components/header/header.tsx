import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import { createAuthReturnState } from '../../features/auth/model/auth-return-location';
import { getCurrentUserRequest } from '../../features/users/api/users-api';
import styles from './header.module.css';

type NavigationItemProps = {
  to: string;
  label: string;
  currentPath: string;
  state?: unknown;
};

const NavigationItem = ({ to, label, currentPath, state }: NavigationItemProps) => (
  <li className={styles.li}>
    {currentPath === to ? (
      <span className={styles.currentLink}>{label}</span>
    ) : (
      <Link className={styles.link} to={to} state={state}>
        <span className={styles.linkText}>{label}</span>
      </Link>
    )}
  </li>
);

const Header = () => {
  const { isAuth, isInitializing } = useAuth();
  const location = useLocation();
  const { pathname } = location;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isInitializing || !isAuth) {
      setIsAdmin(false);
      return;
    }

    let isMounted = true;

    const loadRole = async () => {
      try {
        const user = await getCurrentUserRequest();
        if (isMounted) setIsAdmin(user.role === 'admin');
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, [isAuth, isInitializing, pathname]);

  return (
    <>
      <h1 className={styles.title}>Website name</h1>
      <nav className={styles.nav}>
        <ul className={styles.ul}>
          <NavigationItem to="/" label="Home" currentPath={pathname} />
          <NavigationItem to="/protected-page" label="Protected page" currentPath={pathname} />

          {!isInitializing && !isAuth && (
            <>
              <NavigationItem
                to="/auth/login"
                label="Login"
                currentPath={pathname}
                state={createAuthReturnState(location)}
              />
              <NavigationItem
                to="/auth/registration"
                label="Registration"
                currentPath={pathname}
                state={createAuthReturnState(location)}
              />
            </>
          )}

          {!isInitializing && isAuth && (
            <>
              {isAdmin && (
                <NavigationItem to="/admin/users" label="User management" currentPath={pathname} />
              )}
              <NavigationItem to="/users/me" label="My profile" currentPath={pathname} />
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Header;
