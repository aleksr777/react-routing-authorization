import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import PasswordResetConfirmForm from './password-reset-confirm-form';
import PasswordResetRequestForm from './password-reset-request-form';
import styles from './password-reset.module.css';

const PasswordReset = () => {
  const { isAuth, isInitializing, requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [isCodeStep, setIsCodeStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = String(new FormData(event.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      setError('Enter your email');
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setIsSubmitting(true);
      setMessage(await requestPasswordReset(email));
      setPendingEmail(email);
      setIsCodeStep(true);
    } catch (err: unknown) {
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

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      setError('Password must contain from 8 to 100 characters');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }
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

  const handleUseAnotherEmail = () => {
    setError(null);
    setMessage(null);
    setPendingEmail('');
    setIsCodeStep(false);
  };

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to="/users/me" replace />;

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Password recovery</h2>

      {isCodeStep ? (
        <PasswordResetConfirmForm
          message={message}
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleConfirm}
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
