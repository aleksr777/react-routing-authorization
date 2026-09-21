import { Link, Navigate, useLocation } from 'react-router-dom';
import AuthModalShell from '../auth-modal/auth-modal-shell';
import {
  createAuthReturnState,
  getAuthReturnTo,
} from '../../features/auth/model/auth-return-location';
import PasswordResetConfirmForm from './password-reset-confirm-form';
import PasswordResetRequestForm from './password-reset-request-form';
import { usePasswordReset } from './use-password-reset';
import styles from './password-reset.module.css';

const PasswordReset = () => {
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
    handleRequest,
    handleConfirm,
    handleResend,
    handleUseAnotherEmail,
  } = usePasswordReset(returnTo);

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to={returnTo} replace />;

  return (
    <AuthModalShell title={isCodeStep ? 'Set a new password' : 'Password recovery'}>
      <section className={styles.wrapper}>
        {isCodeStep ? (
          <PasswordResetConfirmForm
            message={verification.message}
            error={error}
            isSubmitting={isSubmitting}
            resendSeconds={verification.resendSeconds}
            maxAttempts={verification.maxAttempts}
            attemptsRemaining={verification.attemptsRemaining}
            onSubmit={handleConfirm}
            onResend={() => void handleResend()}
            onUseAnotherEmail={handleUseAnotherEmail}
          />
        ) : (
          <PasswordResetRequestForm
            error={error}
            isSubmitting={isSubmitting}
            isLocked={verification.isLocked}
            lockoutSeconds={verification.lockoutSeconds}
            onSubmit={handleRequest}
          />
        )}
        <div className={styles.authLinks}>
          <Link to="/auth/login" state={authLinkState}>
            Login
          </Link>
          <Link to="/auth/registration" state={authLinkState}>
            Registration
          </Link>
        </div>
      </section>
    </AuthModalShell>
  );
};

export default PasswordReset;
