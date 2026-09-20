import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import CustomScrollbar from '../src/components/scrollbar/custom-scrollbar';
import { startApp } from './auth-flow-fixture';

beforeEach(() => {
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2400);
});

test('custom scrollbar appears when the home page is taller than the viewport', async () => {
  startApp('/');

  await screen.findByRole('heading', { name: 'Home page' });
  expect(screen.getAllByRole('article')).toHaveLength(8);

  const scrollbar = await screen.findByRole('scrollbar', { name: 'Page scroll' });
  expect(scrollbar.getAttribute('aria-hidden')).toBe('false');
  expect(scrollbar.getAttribute('aria-valuemax')).toBe('100');
});

test('custom scrollbar appears in StrictMode and responds to scrolling and resizing', async () => {
  render(
    <StrictMode>
      <MemoryRouter>
        <CustomScrollbar />
      </MemoryRouter>
    </StrictMode>,
  );

  const scrollbar = await screen.findByRole('scrollbar', { name: 'Page scroll' });
  expect(scrollbar.tabIndex).toBe(0);

  vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(800);
  fireEvent.scroll(window);
  await waitFor(() => expect(scrollbar.getAttribute('aria-valuenow')).toBe('50'));

  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(800);
  fireEvent.resize(window);
  await waitFor(() => expect(scrollbar.getAttribute('aria-hidden')).toBe('true'));
  expect(scrollbar.tabIndex).toBe(-1);

  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2400);
  fireEvent.resize(window);
  await screen.findByRole('scrollbar', { name: 'Page scroll' });
  expect(scrollbar.tabIndex).toBe(0);
});

test('custom scrollbar updates after navigation cancels a pending animation frame', async () => {
  vi.useFakeTimers();
  try {
    const router = createMemoryRouter([{ path: '*', element: <CustomScrollbar /> }]);
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate('/next');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(32);
    });

    const scrollbar = screen.getByRole('scrollbar', { name: 'Page scroll' });
    expect(scrollbar.getAttribute('aria-hidden')).toBe('false');

    vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(800);
    fireEvent.scroll(window);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(32);
    });
    expect(scrollbar.getAttribute('aria-valuenow')).toBe('50');
  } finally {
    vi.useRealTimers();
  }
});

test('thumb size, position and track clicks use the actual track bounds', async () => {
  render(
    <MemoryRouter>
      <CustomScrollbar />
    </MemoryRouter>,
  );
  const scrollbar = await screen.findByRole('scrollbar', { name: 'Page scroll' });
  const thumb = scrollbar.firstElementChild;
  vi.spyOn(scrollbar, 'clientHeight', 'get').mockReturnValue(600);
  vi.spyOn(scrollbar, 'getBoundingClientRect').mockReturnValue({ top: 20 });
  vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(800);
  fireEvent.resize(window);

  await waitFor(() => {
    expect(thumb.style.height).toBe('200px');
    expect(thumb.style.transform).toBe('translateY(200px)');
  });

  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  fireEvent(scrollbar, new MouseEvent('pointerdown', { bubbles: true, button: 0, clientY: 320 }));
  expect(scrollTo).toHaveBeenCalledWith({ top: 800 });
});

test('responsive minimum thumb height never extends beyond a short track', async () => {
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(80000);
  render(
    <MemoryRouter>
      <CustomScrollbar />
    </MemoryRouter>,
  );
  const scrollbar = await screen.findByRole('scrollbar', { name: 'Page scroll' });
  const thumb = scrollbar.firstElementChild;
  scrollbar.style.setProperty('--thumb-min-height', '64px');
  fireEvent.resize(window);
  await waitFor(() => expect(thumb.style.height).toBe('64px'));

  vi.spyOn(scrollbar, 'clientHeight', 'get').mockReturnValue(24);
  fireEvent.resize(window);
  await waitFor(() => expect(thumb.style.height).toBe('24px'));
  expect(thumb.style.transform).toBe('translateY(0px)');
});
