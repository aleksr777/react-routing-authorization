import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentUserRequest,
  updateCurrentUserRequest,
  type CurrentUser,
  type UpdateCurrentUserData,
} from '../../features/users/api/users-api';
import styles from './account-settings.module.css';

const EditProfile = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUserRequest();
        if (!isMounted) return;

        setUser(currentUser);
        setNickname(currentUser.nickname ?? '');
        setName(currentUser.name ?? '');
        setAge(currentUser.age === null ? '' : String(currentUser.age));
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const nextNickname = nickname.trim();
    const nextName = name.trim();
    const nextAge = age.trim();
    const patch: UpdateCurrentUserData = {};

    if (nextNickname !== (user.nickname ?? '')) {
      if (!nextNickname) {
        setError('Nickname cannot be empty');
        return;
      }
      patch.nickname = nextNickname;
    }

    if (nextName !== (user.name ?? '')) {
      if (!nextName) {
        setError('Name cannot be empty');
        return;
      }
      patch.name = nextName;
    }

    if (nextAge !== (user.age === null ? '' : String(user.age))) {
      if (!nextAge) {
        setError('Age cannot be empty');
        return;
      }
      const parsedAge = Number(nextAge);
      if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 200) {
        setError('Age must be an integer from 0 to 200');
        return;
      }
      patch.age = parsedAge;
    }

    if (Object.keys(patch).length === 0) {
      setError(null);
      setMessage('No changes to save');
      return;
    }

    try {
      setError(null);
      setMessage(null);
      setIsSubmitting(true);
      const updatedUser = await updateCurrentUserRequest(patch);
      setUser(updatedUser);
      setNickname(updatedUser.nickname ?? '');
      setName(updatedUser.name ?? '');
      setAge(updatedUser.age === null ? '' : String(updatedUser.age));
      setMessage('Profile updated');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (error && !user) return <p>{error}</p>;

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Edit profile</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Nickname
          <input
            className={styles.input}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            minLength={2}
            maxLength={50}
          />
        </label>

        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={200}
          />
        </label>

        <label className={styles.label}>
          Age
          <input
            className={styles.input}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            type="number"
            min={0}
            max={200}
            step={1}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <Link className={styles.link} to="/users/me/settings">
        Back to settings
      </Link>
    </section>
  );
};

export default EditProfile;
