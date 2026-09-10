import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import { useVerificationRequestState } from '../../shared/model/verification-request';
import PasswordResetConfirmForm from './password-reset-confirm-form';
import PasswordResetRequestForm from './password-reset-request-form';
import styles from './password-reset.module.css';

const PasswordReset = () => {
  const { isAuth, isInitializing, requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const verification = useVerificationRequestState();
  const [isCodeStep, setIsCodeStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase();
    if (!email) return setError('Enter your email');

    try {
      setError(null);
      setIsSubmitting(true);
      verification.applyResult(await requestPasswordReset(email));
      setPendingEmail(email);
      setIsCodeStep(true);
    } catch (err: unknown) {
      if (verification.applyRetryError(err)) {
        setPendingEmail(email);
        setIsCodeStep(true);
      }
      setError(err instanceof Error ? err.message : 'Password reset request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();
    const newPassword = String(formData.get('newPassword') ?? '');
    const newPasswordConfirm = String(formData.get('newPasswordConfirm') ?? '');

    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code');
    if (newPassword.length < 8 || newPassword.length > 100) {
      return setError('Password must contain from 8 to 100 characters');
    }
    if (newPassword !== newPasswordConfirm) return setError('Passwords do not match');
    if (!pendingEmail) {
      setError('Request a new password reset code');
      setIsCodeStep(false);
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmPasswordReset(code, newPassword, pendingEmail);
      navigate('/users/me', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      setError(null);
      setIsSubmitting(true);
      verification.applyResult(await requestPasswordReset(pendingEmail));
    } catch (err: unknown) {
      verification.applyRetryError(err);
      setError(err instanceof Error ? err.message : 'Failed to resend password reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseAnotherEmail = () => {
    setError(null);
    setPendingEmail('');
    verification.reset();
    setIsCodeStep(false);
  };

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to="/users/me" replace />;

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Password recovery</h2>
      {isCodeStep ? (
        <PasswordResetConfirmForm
          message={verification.message}
          error={error}
          isSubmitting={isSubmitting}
          resendSeconds={verification.resendSeconds}
          maxAttempts={verification.maxAttempts}
          onSubmit={handleConfirm}
          onResend={() => void handleResend()}
          onUseAnotherEmail={handleUseAnotherEmail}
        />
      ) : (
        <PasswordResetRequestForm
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleRequest}
        />
      )}
      <div className={styles.authLinks}>
        <Link to="/auth/login">Login</Link>
        <Link to="/auth/registration">Registration</Link>
      </div>
    </section>
  );
};

export default PasswordReset;
