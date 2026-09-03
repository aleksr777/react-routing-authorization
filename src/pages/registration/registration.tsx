import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/model/use-auth';
import RegistrationConfirmForm from './registration-confirm-form';
import RegistrationRequestForm from './registration-request-form';
import styles from './registration.module.css';

const Registration = () => {
  const { isAuth, isInitializing, requestRegistration, confirmRegistration } = useAuth();
  const navigate = useNavigate();

  const [isCodeStep, setIsCodeStep] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistrationRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!email || !password || !passwordConfirm) {
      setError('Fill in all fields');
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setError('Password must contain from 8 to 100 characters');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setIsSubmitting(true);
      setMessage(await requestRegistration(email, password));
      setIsCodeStep(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await confirmRegistration(code);
      navigate('/users/me', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration confirmation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseAnotherEmail = () => {
    setError(null);
    setMessage(null);
    setIsCodeStep(false);
  };

  if (isInitializing) return <p>Loading...</p>;
  if (isAuth) return <Navigate to="/users/me" replace />;

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Registration</h1>

      {isCodeStep ? (
        <RegistrationConfirmForm
          message={message}
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleRegistrationConfirm}
          onUseAnotherEmail={handleUseAnotherEmail}
        />
      ) : (
        <RegistrationRequestForm
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={handleRegistrationRequest}
        />
      )}

      <Link className={styles.link} to="/auth/password-reset">
        Forgot password?
      </Link>
    </section>
  );
};

export default Registration;
