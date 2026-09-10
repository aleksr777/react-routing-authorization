# react-routing-authorization

React + Vite frontend for the routing and authorization template.

Companion backend: [nestjs-routing-authorization](https://github.com/aleksr777/nestjs-routing-authorization)

The application is designed to work with the NestJS backend from `nestjs-routing-authorization`.

## Feature overview

The frontend provides:

- registration, login, logout, and password recovery screens;
- automatic access-token refresh through the backend refresh cookie;
- protected and administrator-only routing;
- current-user profile and account settings;
- profile editing, email change, password change/reset, and self-account deletion flows;
- one-time blocked-account notification with reason and administrator contact email;
- administrator user search, pagination, viewing, blocking, unblocking, and deletion;
- current-administrator password confirmation before blocking or deleting another user;
- administrator-rights transfer with current administrator password confirmation;
- pending-transfer synchronization across administrator pages;
- transfer cancellation only on the target user's management page;
- disabled transfer actions for all other users while a transfer is pending;
- transfer acceptance with a six-digit code and the recipient's current password;
- backend-enforced limits for incorrect verification-code confirmation attempts;
- backend-enforced registration/password-reset code resend cooldowns with a visible countdown.

## Tech stack

- React 18
- TypeScript
- Vite
- React Router
- ESLint
- Prettier
- Stylelint
- gh-pages deployment tooling

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

### Authentication flow

```text
login / registration / password reset
        ↓
backend returns access token
backend sets refresh token as HttpOnly cookie
        ↓
access token stored in frontend memory
        ↓
API request with Bearer access token + credentials
        ↓
access token expires or approaches expiry
        ↓
frontend calls POST /api/auth/refresh-tokens
        ↓
refresh cookie is sent automatically by the browser
        ↓
new access token stored in memory
        ↓
original protected request can be retried
```

Reloading the page clears the in-memory access token, so the application relies on the refresh-cookie flow to restore authentication state when possible.

## Verification-code limits and resend countdown

The backend remains the source of truth for verification-code restrictions. The frontend displays the values returned by the server.

For registration and public password reset:

- up to `5` incorrect code attempts are allowed for each active confirmation cycle;
- after a code is sent, another code cannot be requested until the backend cooldown expires;
- the example backend configuration uses a `60` second cooldown;
- the confirmation page shows `Maximum 5 incorrect code attempts`;
- while the cooldown is active, `Resend code` is disabled and the page shows a live countdown such as `You can request a new code in 00:42`;
- successful request responses provide `retry_after` and `max_attempts`, so the frontend does not hardcode the countdown duration;
- if a resend request reaches the server too early, HTTP `429` includes the actual remaining `retry_after`, and the frontend resynchronizes its timer to that value;
- a successfully reissued registration/password-reset code starts a new attempt cycle and makes the previous code invalid.

Registration resends use:

```text
POST /api/auth/registration/resend
```

Only the email is sent for registration resend. The frontend does not retain the user's plaintext registration password merely to resend a code.

Public password-reset resends reuse:

```text
POST /api/auth/password-reset/request
```

Administrator-rights transfer keeps its stricter limit of `3` incorrect code attempts; on the third incorrect code attempt, the pending transfer is invalidated by the backend.

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
- block a user with an optional reason after entering the administrator's current password;
- unblock a user after an explicit confirmation step;
- delete a user permanently after entering the administrator's current password;
- initiate transfer of administrator rights.

The password confirmation for block/delete is not only a frontend check: the password is sent to the backend and verified there before the target account is modified. Incorrect-password errors are displayed inside the corresponding confirmation panel below its action buttons.

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

The backend permits no more than 3 incorrect code attempts for the recipient. On the third incorrect code attempt, the pending transfer is invalidated.

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

## Security properties

- The frontend never stores the refresh token in JavaScript-accessible storage; it is handled by the browser as an HttpOnly cookie set by the backend.
- Access tokens are kept in memory rather than localStorage/sessionStorage.
- Protected routes and `AdminRoute` are UX controls only; backend authorization remains mandatory.
- Blocked-account state is intentionally not persisted after the one-time notification.
- Verification-code attempt and resend limits are enforced by the backend, not by frontend state.
- Registration resends do not require retaining the plaintext registration password in frontend state.
- Administrator user blocking and deletion require current-administrator password re-entry and backend verification.
- Administrator transfer initiation requires the current administrator's password.
- Transfer acceptance requires the recipient's six-digit code and current password.
- Pending administrator-transfer state is read from the backend instead of being trusted as frontend-only state.
- Transfer cancellation is shown only on the management page of the user who received the active invitation.

## Deployment notes

For production, `VITE_API_URL` must point to the deployed backend API rather than the local `http://localhost:5174/api` value.

Because authentication uses an HttpOnly refresh cookie and credentialed requests, frontend and backend deployment settings must remain compatible:

- serve the application over HTTPS;
- configure the backend CORS origin for the real frontend origin;
- ensure credentialed requests are allowed only for trusted origins;
- align the backend refresh-cookie `Secure` and `SameSite` settings with whether frontend and backend are same-site or cross-site;
- do not move the refresh token into localStorage or other JavaScript-accessible storage as a deployment workaround;
- configure the correct SPA fallback / routing behavior on the hosting platform so direct navigation to routes such as `/users/me` and `/admin/transfer/confirm` works.

The current repository includes `gh-pages` deployment tooling, but production routing and backend connectivity still depend on the final hosting topology.

## Backend dependency

This frontend expects the companion [NestJS backend](https://github.com/aleksr777/nestjs-routing-authorization) to provide the `/api/auth`, `/api/users`, and `/api/admin` routes described in its README.

For local development, keep these values aligned:

```text
frontend: http://localhost:5173
backend:  http://localhost:5174
API:      http://localhost:5174/api
```
