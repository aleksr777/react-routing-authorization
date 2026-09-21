import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { clearAuthTokens, getAccessToken } from '../src/shared/api/tokens';
import { fill, startApp, submit } from './auth-flow-fixture';

const observeNavigation = (router) => {
  const paths = [];
  router.subscribe((state) => paths.push(state.location.pathname));
  return paths;
};

test('a server-closed session opens Home without mounting Login', async () => {
  const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
  const { router } = startApp('/users/me', { signedIn: true, sessionStatus: 401 });
  const paths = observeNavigation(router);

  await screen.findByRole('heading', { name: 'Home page' });
  expect(router.state.location.pathname).toBe('/');
  expect(getAccessToken()).toBeNull();
  expect(paths).not.toContain('/auth/login');
  expect(showModal).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('an external session-clear event opens Home without mounting Login', async () => {
  const { router } = startApp('/users/me', { signedIn: true });
  await screen.findByRole('button', { name: 'Logout' });
  const paths = observeNavigation(router);
  const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');

  clearAuthTokens();

  await screen.findByRole('heading', { name: 'Home page' });
  expect(router.state.location.pathname).toBe('/');
  expect(getAccessToken()).toBeNull();
  expect(paths).not.toContain('/auth/login');
  expect(showModal).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();

  fireEvent.click(screen.getByRole('link', { name: 'Protected page' }));
  await screen.findByRole('dialog', { name: 'Login' });
});

test('a direct Login link returns to the public page that opened it', async () => {
  const { router } = startApp('/missing?source=login#top');
  await screen.findByRole('heading', { name: 'Page not found!' });
  fireEvent.click(screen.getByRole('link', { name: 'Login' }));
  await screen.findByRole('dialog', { name: 'Login' });
  fill('Email', 'user@example.com');
  fill('Password', 'password12345');
  submit('Sign in');

  await screen.findByRole('heading', { name: 'Page not found!' });
  expect(router.state.location).toMatchObject({
    pathname: '/missing',
    search: '?source=login',
    hash: '#top',
  });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('registration returns to the public page that opened it', async () => {
  const { router } = startApp('/missing');
  await screen.findByRole('heading', { name: 'Page not found!' });
  fireEvent.click(screen.getByRole('link', { name: 'Registration' }));
  await screen.findByRole('dialog', { name: 'Registration' });
  fill('Email', 'user@example.com');
  fill('Password', 'password12345');
  fill('Repeat password', 'password12345');
  submit('Create account');
  await screen.findByRole('dialog', { name: 'Confirm registration' });
  fill('Confirmation code', '123456');
  submit('Confirm registration');

  await screen.findByRole('heading', { name: 'Page not found!' });
  expect(router.state.location.pathname).toBe('/missing');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('password recovery returns to the public page that opened it', async () => {
  const { router } = startApp('/missing');
  await screen.findByRole('heading', { name: 'Page not found!' });
  fireEvent.click(screen.getByRole('link', { name: 'Login' }));
  await screen.findByRole('dialog', { name: 'Login' });
  fireEvent.click(screen.getByRole('link', { name: 'Forgot password?' }));
  await screen.findByRole('dialog', { name: 'Password recovery' });
  fill('Email', 'user@example.com');
  submit('Send reset code');
  await screen.findByRole('dialog', { name: 'Set a new password' });
  fill('Reset code', '123456');
  fill('New password', 'new-password123');
  fill('Repeat new password', 'new-password123');
  submit('Reset password');

  await screen.findByRole('heading', { name: 'Page not found!' });
  expect(router.state.location.pathname).toBe('/missing');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('login after a protected-route redirect returns to that exact protected URL', async () => {
  const { router } = startApp('/protected-page?next=details#section');
  await screen.findByRole('dialog', { name: 'Login' });
  fill('Email', 'user@example.com');
  fill('Password', 'password12345');
  submit('Sign in');

  await screen.findByRole('heading', { name: 'Protected Page' });
  expect(router.state.location).toMatchObject({
    pathname: '/protected-page',
    search: '?next=details',
    hash: '#section',
  });
});

test('closing Login after a protected-route redirect returns Home instead of reopening Login', async () => {
  const { router } = startApp('/protected-page');
  const dialog = await screen.findByRole('dialog', { name: 'Login' });

  fireEvent(dialog, new Event('cancel', { cancelable: true }));

  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  expect(screen.getByRole('heading', { name: 'Home page' })).toBeTruthy();
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
