// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { usePageTitle } from './usePageTitle';

const wrapper = (path: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('usePageTitle', () => {
  it.each([
    ['/', 'Xcode'],
    ['/auth', 'Auth'],
    ['/tournaments', 'Tournaments'],
    ['/tournaments/abc-123', 'Tournaments'],
    ['/tasks', 'Tasks'],
    ['/tasks/42', 'Tasks'],
    ['/dashboard', 'Dashboard'],
  ])('ставить title "%s" → "%s"', (path, expected) => {
    renderHook(() => usePageTitle(), { wrapper: wrapper(path) });

    expect(document.title).toBe(expected);
  });

  it('невідомий маршрут отримує fallback "Xcode"', () => {
    renderHook(() => usePageTitle(), { wrapper: wrapper('/no-such-page') });

    expect(document.title).toBe('Xcode');
  });

  it('не спамить у консоль, коли title вже правильний', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.useFakeTimers();

    renderHook(() => usePageTitle(), { wrapper: wrapper('/') });

    // Проганяємо весь час життя сторожових таймерів (3 с):
    // раніше тут було ~34 однакові рядки «Title already correct»
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(document.title).toBe('Xcode');
    expect(logSpy.mock.calls.length).toBeLessThanOrEqual(3);
  });
});
