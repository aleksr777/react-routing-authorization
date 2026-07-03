import AppLayout from './components/app-layout/app-layout';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './features/auth/ui/protected-route';
import Home from './pages/home/home';
import Login from './pages/login/login';
import MyProfile from './pages/my-profile/my-profile';
import NotFound from './pages/not-found/not-found';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="auth/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="users/me" element={<MyProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
