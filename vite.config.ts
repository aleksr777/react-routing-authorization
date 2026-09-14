import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

const isLocalApiHost = (hostname: string): boolean =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = process.env.VITE_API_URL ?? fileEnv.VITE_API_URL;

  if (mode === 'production') {
    if (!apiUrl) {
      throw new Error(
        'VITE_API_URL is required for production builds. Refusing to build with a localhost fallback.',
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(apiUrl);
    } catch {
      throw new Error('VITE_API_URL must be a valid absolute URL.');
    }

    if (parsed.protocol !== 'https:' && !isLocalApiHost(parsed.hostname)) {
      throw new Error(
        'VITE_API_URL must use HTTPS for non-local production builds.',
      );
    }
  }

  return {
    plugins: [react()],
    base: '/',
  };
});
