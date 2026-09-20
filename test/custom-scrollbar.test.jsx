import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { startApp } from './auth-flow-fixture';

test('custom scrollbar appears when the home page is taller than the viewport', async () => {
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2400);
  vi.spyOn(document.documentElement, 'offsetHeight', 'get').mockReturnValue(2400);
  vi.spyOn(document.body, 'scrollHeight', 'get').mockReturnValue(2400);
  vi.spyOn(document.body, 'offsetHeight', 'get').mockReturnValue(2400);

  startApp('/');

  await screen.findByRole('heading', { name: 'Home page' });
  expect(screen.getAllByRole('article')).toHaveLength(8);

  const scrollbar = await screen.findByRole('scrollbar', { name: 'Page scroll' });
  expect(scrollbar.getAttribute('aria-hidden')).toBe('false');
  expect(scrollbar.getAttribute('aria-valuemax')).toBe('100');
});
