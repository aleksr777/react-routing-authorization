import type { PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../../components/modal/modal';
import { getAuthModalCloseTo } from '../../features/auth/model/auth-return-location';
import Home from '../home/home';

const AuthModalShell = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const closeTo = getAuthModalCloseTo(location.state);

  return (
    <>
      <Home />
      <Modal title={title} onClose={() => navigate(closeTo, { replace: true })}>
        {children}
      </Modal>
    </>
  );
};

export default AuthModalShell;
