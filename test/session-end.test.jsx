import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { expect, test, vi } from 'vitest';
import {
  getAccessToken,
  setAuthTokens,
  subscribeAuthTokensCleared,
} from '../src/shared/api/tokens';
import { fill, startApp, submit } from './auth-flow-fixture';

const observeNavigation = (router) => {
  const paths = [];
  router.subscribe((state) => paths.push(state.location.pathname));
  const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
  return { paths, showModal };
};

test.each([200, 401, 500, 'network'])(
  'logout opens Home without mounting Login, including request result %s',
  async (logoutStatus) => {
    const { router, calls } = startApp('/users/me', { signedIn: true, logoutStatus });
    await screen.findByRole('button', { name: 'Logout' });
    const { paths, showModal } = observeNavigation(router);
    // Session subscribers can trigger an urgent render before navigation commits.
    const unsubscribe = subscribeAuthTokensCleared(() => flushSync(() => {}));
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
      await screen.findByRole('heading', { name: 'Home page' });
      await waitFor(() => expect(getAccessToken()).toBeNull());
      expect(router.state.location.pathname).toBe('/');
      expect(paths).not.toContain('/auth/login');
      expect(showModal).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(calls.filter((c) => c.endpoint === '/auth/logout')).toHaveLength(1);
      expect(calls.find((c) => c.endpoint === '/auth/logout').headers.Authorization).toBe(
        'Bearer existing-access-token',
      );
      if (logoutStatus === 200) {
        fireEvent.click(screen.getByRole('link', { name: 'Protected page' }));
        await screen.findByRole('dialog', { name: 'Login' });
        expect(router.state.location.pathname).toBe('/auth/login');
      }
    } finally {
      unsubscribe();
    }
  },
);

test('Delete profile immediately opens a password modal over the current profile', async () => {
  const { router, calls } = startApp('/users/me', { signedIn: true });
  await screen.findByRole('link', { name: 'Delete profile' });
  fireEvent.click(screen.getByRole('link', { name: 'Delete profile' }));
  const dialog = await screen.findByRole('dialog', { name: 'Delete your account' });
  expect(screen.getByRole('heading', { name: 'My profile' })).toBeTruthy();
  expect(router.state.location.pathname).toBe('/users/me/settings/delete');
  expect(within(dialog).getByLabelText('Current password').value).toBe('');
  expect(within(dialog).getByLabelText('Current password').autocomplete).toBe('new-password');
  expect(within(dialog).getByRole('button', { name: 'Confirm deletion' }).disabled).toBe(true);
  submit('Confirm deletion');
  expect(calls.some((c) => c.endpoint === '/users/me/delete')).toBe(false);
  fill('Current password', 'password12345');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(router.state.location.pathname).toBe('/users/me');
  expect(getAccessToken()).toBe('existing-access-token');
  expect(calls.some((c) => c.endpoint === '/users/me/delete')).toBe(false);
  fireEvent.click(screen.getByRole('link', { name: 'Delete profile' }));
  await screen.findByRole('dialog', { name: 'Delete your account' });
  expect(screen.getByLabelText('Current password').value).toBe('');
});

test('self-deletion keeps the modal open on a wrong password, then clears the session and opens Home', async () => {
  const { router, calls } = startApp('/users/me/settings/delete', { signedIn: true });
  await screen.findByRole('dialog', { name: 'Delete your account' });
  const { paths, showModal } = observeNavigation(router);
  fill('Current password', 'incorrect-password');
  submit('Confirm deletion');
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Current password').value).toBe('');
  expect(getAccessToken()).toBe('existing-access-token');
  const unsubscribe = subscribeAuthTokensCleared(() => flushSync(() => {}));
  try {
    fill('Current password', 'password12345');
    submit('Confirm deletion');
    await screen.findByRole('heading', { name: 'Home page' });
    expect(getAccessToken()).toBeNull();
    expect(router.state.location.pathname).toBe('/');
    expect(paths).not.toContain('/auth/login');
    expect(showModal).not.toHaveBeenCalled();
    expect(calls.filter((c) => c.endpoint === '/users/me/delete').map((c) => c.body)).toEqual([
      { password: 'incorrect-password' },
      { password: 'password12345' },
    ]);
  } finally {
    unsubscribe();
  }
});

test('the administrator still cannot delete their own profile, including the direct URL', async () => {
  const { calls } = startApp('/users/me/settings/delete', { signedIn: true, adminLogin: true });
  const dialog = await screen.findByRole('dialog', { name: 'Delete your account' });
  expect(within(dialog).getByText('Administrator profile cannot be deleted.')).toBeTruthy();
  expect(within(dialog).queryByLabelText('Current password')).toBeNull();
  expect(calls.some((c) => c.endpoint === '/users/me/delete')).toBe(false);
});

test('an expired session still opens Login when no deliberate sign-out is in progress', async () => {
  const { router } = startApp('/users/me');
  await screen.findByRole('dialog', { name: 'Login' });
  expect(router.state.location.pathname).toBe('/auth/login');
});

test('logout handles an expired refresh session and later protected links still open Login', async () => {
  const { router } = startApp('/users/me', { signedIn: true });
  await screen.findByRole('button', { name: 'Logout' });
  const { paths, showModal } = observeNavigation(router);
  const originalFetch = globalThis.fetch;
  vi.stubGlobal(
    'fetch',
    vi.fn((url, options) => {
      if (new URL(url).pathname.endsWith('/auth/refresh-tokens')) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Session expired' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return originalFetch(url, options);
    }),
  );
  setAuthTokens({ access_token: 'existing-access-token', access_token_expires: 0 });
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  await screen.findByRole('heading', { name: 'Home page' });
  expect(getAccessToken()).toBeNull();
  expect(paths).not.toContain('/auth/login');
  expect(showModal).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('link', { name: 'Protected page' }));
  await screen.findByRole('dialog', { name: 'Login' });
});
