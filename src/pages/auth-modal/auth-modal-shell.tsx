import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/modal/modal';
import Home from '../home/home';

const AuthModalShell = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  const navigate = useNavigate();

  return (
    <>
      <Home />
      <Modal title={title} onClose={() => navigate('/', { replace: true })}>
        {children}
      </Modal>
    </>
  );
};

export default AuthModalShell;
