import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.stubGlobal('BroadcastChannel', undefined);

if (typeof HTMLDialogElement !== 'undefined') {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open');
    },
  });
}
const { clearAuthTokens } = await import('../src/shared/api/tokens');

afterEach(() => {
  cleanup();
  clearAuthTokens(false);
  vi.restoreAllMocks();
});
