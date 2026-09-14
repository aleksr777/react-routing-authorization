# Frontend security

The application keeps access tokens in JavaScript memory and refresh tokens in an `HttpOnly` cookie issued by the API. Do not move access tokens to `localStorage` or `sessionStorage`.

## Content Security Policy

`index.html` contains a browser-enforced CSP meta policy so the GitHub Pages build has a baseline policy even though GitHub Pages does not allow this repository to configure arbitrary HTTP response headers.

For production hosting under your own reverse proxy or a provider that supports custom response headers, prefer sending CSP as an HTTP response header and tighten `connect-src` to the exact API origin.

Recommended additional response headers for production hosting:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.example.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Content-Type-Options: nosniff
```

`frame-ancestors` cannot be enforced from a CSP `<meta>` element, so clickjacking protection should be configured as an HTTP response header when the frontend is moved behind a configurable production host.

## Deployment

The CI workflow runs dependency audit, ESLint, Prettier, regression tests, and the production build for pull requests into `develop`. The GitHub Pages deployment repeats these checks before publishing `develop`.
