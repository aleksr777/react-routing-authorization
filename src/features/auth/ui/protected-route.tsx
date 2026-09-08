import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../model/use-auth';

const ProtectedRoute = () => {
  const { isAuth, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <p>Loading...</p>;
  }

  if (!isAuth) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
