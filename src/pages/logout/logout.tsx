import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;

    const runLogout = async () => {
      await logout();
      navigate('/', { replace: true });
    };

    void runLogout();
  }, [logout, navigate]);

  return <p>Signing out...</p>;
};

export default Logout;
