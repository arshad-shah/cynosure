import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { ThemeProvider } from '../ThemeProvider.js';
import { useColorScheme } from '../hooks/useColorScheme.js';

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock({ '(prefers-color-scheme: dark)': false });
  window.localStorage.clear();
});

afterEach(() => media.reset());

describe('useColorScheme', () => {
  it('returns the resolved colour scheme of the active theme', () => {
    media.set('(prefers-color-scheme: dark)', true);
    const { result } = renderHook(() => useColorScheme(), {
      wrapper: ({ children }) => <ThemeProvider defaultTheme="system">{children}</ThemeProvider>,
    });
    expect(result.current).toBe('dark');
  });
});
