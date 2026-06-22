import { useEffect, useState } from 'react';
import { getCurrentUserRequest, type CurrentUser } from '../../features/users/api/users-api';

const MyProfile = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUserRequest();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <section>
      <h1>My profile</h1>

      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Nickname: {user.nickname}</p>
      <p>Role: {user.role}</p>
    </section>
  );
};

export default MyProfile;
