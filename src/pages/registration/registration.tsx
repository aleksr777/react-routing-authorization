import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthModalShell from '../auth-modal/auth-modal-shell';
import {
  createAuthReturnState,
  getAuthReturnTo,
} from '../../features/auth/model/auth-return-location';
import RegistrationConfirmForm from './registration-confirm-form';
import RegistrationRequestForm from './registration-request-form';
import { useRegistration } from './use-registration';
import styles from './registration.module.css';

const Registration = () => {
  const location = useLocation();
  const returnTo = getAuthReturnTo(location.state);
  const authLinkState = createAuthReturnState(location);
  const {
    isAuth,
    isInitializing,
    isCodeStep,
    error,
    isSubmitting,
    verification,
    handleRegistrationRequest,
    handleRegistrationConfirm,
    handleResend,
    handleUseAnotherEmail,
  } = useRegistration(returnTo);

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to={returnTo} replace />;

  return (
    <AuthModalShell title={isCodeStep ? 'Confirm registration' : 'Registration'}>
      <section className={styles.wrapper}>
        {isCodeStep ? (
          <RegistrationConfirmForm
            message={verification.message}
            error={error}
            isSubmitting={isSubmitting}
            resendSeconds={verification.resendSeconds}
            maxAttempts={verification.maxAttempts}
            attemptsRemaining={verification.attemptsRemaining}
            onSubmit={handleRegistrationConfirm}
            onResend={() => void handleResend()}
            onUseAnotherEmail={handleUseAnotherEmail}
          />
        ) : (
          <RegistrationRequestForm
            error={error}
            isSubmitting={isSubmitting}
            isLocked={verification.isLocked}
            lockoutSeconds={verification.lockoutSeconds}
            onSubmit={handleRegistrationRequest}
          />
        )}
        <Link className={styles.link} to="/auth/password-reset" state={authLinkState}>
          Forgot password?
        </Link>
        <Link className={styles.link} to="/auth/login" state={authLinkState}>
          Login
        </Link>
      </section>
    </AuthModalShell>
  );
};

export default Registration;
