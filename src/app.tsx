import AppLayout from './components/app-layout/app-layout';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './features/auth/ui/protected-route';
import Home from './pages/home/home';
import Login from './pages/login/login';
import PasswordReset from './pages/password-reset/password-reset';
import Registration from './pages/registration/registration';
import MyProfile from './pages/my-profile/my-profile';
import Settings from './pages/account-settings/settings';
import ChangePassword from './pages/account-settings/change-password';
import ChangeEmail from './pages/account-settings/change-email';
import NotFound from './pages/not-found/not-found';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/registration" element={<Registration />} />
        <Route path="auth/password-reset" element={<PasswordReset />} />
        <Route element={<ProtectedRoute />}>
          <Route path="users/me" element={<MyProfile />} />
          <Route path="users/me/settings" element={<Settings />} />
          <Route path="users/me/settings/password" element={<ChangePassword />} />
          <Route path="users/me/settings/email" element={<ChangeEmail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
