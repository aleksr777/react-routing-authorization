import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { getAccessToken } from '../src/shared/api/tokens';
import UserManagementActions from '../src/pages/admin/user-management-actions';
import { fill, startApp, submit } from './auth-flow-fixture';

const targetUser = { id: 2, role: 'user', email: 'user@example.com', is_blocked: false };

test('administrator remains unauthenticated until a correct email code is entered', async () => {
  const { calls } = startApp('/auth/login', { adminLogin: true });
  await screen.findByRole('dialog', { name: 'Login' });
  fill('Email', 'admin@example.com');
  fill('Password', 'admin-password');
  submit('Sign in');
  const dialog = await screen.findByRole('dialog', { name: 'Confirm administrator sign-in' });
  expect(getAccessToken()).toBeNull();
  expect(calls.some((c) => c.endpoint === '/users/me')).toBe(false);
  expect(within(dialog).queryByLabelText('Password')).toBeNull();
  const code = screen.getByLabelText('Email confirmation code');
  expect(code.autocomplete).toBe('off');
  expect(code.value).toBe('');
  expect(screen.getByRole('button', { name: 'Resend code in 01:00' }).disabled).toBe(true);
  fill('Email confirmation code', '000000');
  submit('Confirm sign-in');
  await screen.findByRole('alert');
  expect(getAccessToken()).toBeNull();
  expect(code.value).toBe('');
  fill('Email confirmation code', '123456');
  submit('Confirm sign-in');
  await waitFor(() => expect(getAccessToken()).toBe('new-access-token'));
  expect(calls.find((c) => c.endpoint === '/auth/login/admin/confirm').body).not.toHaveProperty(
    'password',
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('ordinary login does not ask for an email code', async () => {
  startApp('/auth/login');
  await screen.findByRole('dialog', { name: 'Login' });
  fill('Email', 'user@example.com');
  fill('Password', 'user-password');
  submit('Sign in');
  await waitFor(() => expect(getAccessToken()).toBe('existing-access-token'));
  expect(screen.queryByLabelText('Email confirmation code')).toBeNull();
});

test('returning from the code step clears credentials and starts a fresh login form', async () => {
  startApp('/auth/login', { adminLogin: true });
  await screen.findByRole('dialog', { name: 'Login' });
  fill('Email', 'admin@example.com');
  fill('Password', 'admin-password');
  submit('Sign in');
  await screen.findByRole('dialog', { name: 'Confirm administrator sign-in' });
  fill('Email confirmation code', '123');
  fireEvent.click(screen.getByRole('button', { name: 'Back to login' }));
  await screen.findByRole('dialog', { name: 'Login' });
  expect(screen.getByLabelText('Password').value).toBe('');
  expect(getAccessToken()).toBeNull();
});

test.each([false, true])(
  'blocking/unblocking uses a modal without a password: %s',
  async (blocked) => {
    const onBlock = vi.fn(async () => {});
    const onUnblock = vi.fn(async () => {});
    render(
      <UserManagementActions
        user={{ ...targetUser, is_blocked: blocked }}
        isBusy={false}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: blocked ? 'Unblock user' : 'Block user' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByLabelText(/password/i)).toBeNull();
    if (!blocked) fill('Block reason (optional)', 'Test reason');
    submit(blocked ? 'Confirm unblock' : 'Confirm block');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    if (blocked) expect(onUnblock).toHaveBeenCalledWith();
    else expect(onBlock).toHaveBeenCalledWith('Test reason');
  },
);

test('delete requires a password and clears it after cancellation and server rejection', async () => {
  const onDelete = vi.fn(async () => {
    throw new Error('Incorrect administrator password');
  });
  render(
    <UserManagementActions
      user={targetUser}
      isBusy={false}
      onBlock={vi.fn()}
      onUnblock={vi.fn()}
      onDelete={onDelete}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
  await screen.findByRole('dialog', { name: 'Delete account' });
  expect(screen.getByRole('button', { name: 'Confirm delete' }).disabled).toBe(true);
  const field = screen.getByLabelText('Current administrator password');
  expect(field.autocomplete).toBe('new-password');
  fill('Current administrator password', 'admin-password');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(onDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
  expect(screen.getByLabelText('Current administrator password').value).toBe('');
  fill('Current administrator password', 'wrong-password');
  submit('Confirm delete');
  await screen.findByText('Incorrect administrator password');
  expect(onDelete).toHaveBeenCalledWith('wrong-password');
  expect(screen.getByLabelText('Current administrator password').value).toBe('');
});

test('a pending account action cannot be dismissed or submitted twice', async () => {
  const onDelete = vi.fn();
  const props = { user: targetUser, onBlock: vi.fn(), onUnblock: vi.fn(), onDelete };
  const view = render(<UserManagementActions {...props} isBusy={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Delete user' }));
  const dialog = await screen.findByRole('dialog');
  view.rerender(<UserManagementActions {...props} isBusy />);
  expect(within(dialog).getByRole('button', { name: 'Close modal' }).disabled).toBe(true);
  expect(within(dialog).getByRole('button', { name: 'Cancel' }).disabled).toBe(true);
  fireEvent(dialog, new Event('cancel', { cancelable: true }));
  expect(dialog.open).toBe(true);
  expect(onDelete).not.toHaveBeenCalled();
});
