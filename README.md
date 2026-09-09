# react-routing-authorization

React + Vite frontend for the routing and authorization template.

Companion backend: [nestjs-routing-authorization](https://github.com/aleksr777/nestjs-routing-authorization)

The application is designed to work with the NestJS backend from `nestjs-routing-authorization`.

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5174/api
```

The expected local setup is:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5174`
- backend API prefix: `/api`

## Run locally

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
npm run prettier
npm run preview
```

## Authentication model

- Access tokens are kept on the client side in memory.
- Refresh tokens are handled by the backend through an HttpOnly cookie and are not stored in frontend JavaScript.
- API requests include credentials so the refresh cookie can be used.
- The API client refreshes authentication when necessary and retries protected requests after refresh.
- Protected routes redirect unauthenticated users to `/auth/login` and preserve the requested path for return after login.
- Administrator routes are additionally protected by `AdminRoute`; backend role guards remain the actual authorization boundary.

## Blocked accounts

When a blocked user enters valid credentials, the backend returns block information instead of authentication tokens.

The frontend then redirects once to:

```text
/blocked
```

The page displays:

- that the account is blocked;
- the administrator-provided reason, if present;
- the current administrator contact email returned by the backend.

Blocked-account information is not persisted in `sessionStorage`. After the user leaves `/blocked`, refreshes it, returns to it from history, or opens protected pages, the user is handled as an ordinary unauthenticated visitor and is redirected to login where appropriate.

## Main routes

### Public

- `/` — home
- `/auth/login` — login
- `/auth/registration` — registration
- `/auth/password-reset` — public password reset
- `/blocked` — one-time blocked-account notice
- `/forbidden` — insufficient-access page

### Authenticated user

- `/protected-page` — protected-route example
- `/users/me` — current profile
- `/users/me/settings` — account settings
- `/users/me/settings/profile` — edit profile
- `/users/me/settings/password` — change/reset password
- `/users/me/settings/email` — change email
- `/users/me/settings/delete` — delete account
- `/admin/transfer/confirm` — recipient confirmation of administrator-rights transfer

### Administrator

- `/admin/users` — user management list
- `/admin/users/:id` — user management details and actions

## User management

The administrator can:

- search and paginate users;
- open a dedicated user-details page;
- block a user with a reason;
- unblock a user after an explicit confirmation step;
- delete a user after an explicit confirmation step;
- initiate transfer of administrator rights.

Conflicting destructive actions are disabled while another confirmation flow is active.

## Administrator rights transfer

### 1. Initiation by current administrator

On a user's management page, the administrator chooses:

```text
Transfer administrator rights
```

Before the invitation can be sent, the administrator must enter their current password. The frontend sends both the target user ID and the password to the backend. The backend verifies the password before creating the invitation.

After a successful initiation, the backend reports an active pending transfer. The frontend polls the transfer status every 5 seconds so other open admin pages synchronize with the server state.

### 2. UI while a transfer is pending

Only one administrator-rights transfer can be active at a time.

On the page of the user who received the invitation, the normal transfer button is replaced with:

```text
Cancel administrator rights transfer
```

Cancellation itself requires a confirmation step.

On every other user's page, the normal transfer button remains visible but is disabled until the current transfer is confirmed, cancelled, or expires.

The backend is the source of truth for this state; disabling buttons is only a UX layer. Direct attempts to initiate another transfer are rejected by the server while one is pending.

### 3. Cancellation

If the current administrator cancels before the recipient confirms, the backend invalidates the pending transfer and its confirmation code immediately. The frontend refreshes transfer status after a successful cancellation, so transfer buttons become available again without waiting for the next polling interval.

### 4. Recipient confirmation

The invitation email links to:

```text
/admin/transfer/confirm
```

The recipient must be authenticated and enter:

- the six-digit invitation code;
- their own current account password.

After successful confirmation, the backend changes the roles transactionally. The former administrator loses administrator access and the recipient becomes the new administrator.

## Administrator transfer state synchronization

The frontend reads:

```text
GET /api/admin/transfer/status
```

The response contains:

```json
{
  "pending": true,
  "target_user_id": 123
}
```

This allows every user-management detail page to decide whether to:

- show the cancellation button for the invitation target;
- disable the transfer button for all other users;
- restore normal transfer actions after cancellation or TTL expiration.

## Account settings flows

The frontend supports:

- partial profile editing;
- email change with confirmation code;
- password change after current-password verification;
- authenticated password reset by emailed code;
- self-account deletion after password verification.

Authentication state is refreshed after flows that issue new tokens.

## Backend dependency

This frontend expects the companion [NestJS backend](https://github.com/aleksr777/nestjs-routing-authorization) to provide the `/api/auth`, `/api/users`, and `/api/admin` routes described in its README.

For local development, keep these values aligned:

```text
frontend: http://localhost:5173
backend:  http://localhost:5174
API:      http://localhost:5174/api
```
