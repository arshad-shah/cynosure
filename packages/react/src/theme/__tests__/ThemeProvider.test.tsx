import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { ThemeProvider } from '../ThemeProvider.js';
import { useTheme } from '../hooks/useTheme.js';

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock({ '(prefers-color-scheme: dark)': false });
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  window.localStorage.clear();
});

afterEach(() => {
  media.reset();
});

describe('ThemeProvider', () => {
  it('applies the default theme to <html data-theme>', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <span>hello</span>
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('resolves "system" via prefers-color-scheme', () => {
    media.set('(prefers-color-scheme: dark)', true);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="system" themes={['light', 'dark']}>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.colorScheme).toBe('dark');
  });

  it('reacts to system colour-scheme changes when theme is "system"', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colorScheme).toBe('light');
    act(() => {
      media.set('(prefers-color-scheme: dark)', true);
    });
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('persists setTheme to localStorage and rehydrates', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light" themes={['light', 'dark']}>
        {children}
      </ThemeProvider>
    );
    const { result, unmount } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('dark'));
    expect(window.localStorage.getItem('lumen-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    unmount();

    const remount = renderHook(() => useTheme(), { wrapper });
    expect(remount.result.current.theme).toBe('dark');
  });

  it('falls back to defaultTheme when setTheme is given an unknown value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light" themes={['light', 'dark']}>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('bogus'));
    expect(result.current.theme).toBe('light');
  });

  it('honours custom theme names from the themes whitelist', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light" themes={['light', 'dark', 'terminal']}>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('terminal'));
    expect(result.current.theme).toBe('terminal');
    expect(result.current.resolvedTheme).toBe('terminal');
    expect(result.current.colorScheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal');
  });

  it('writes through a custom storage adapter', () => {
    const store = new Map<string, string>();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider
        defaultTheme="light"
        themes={['light', 'dark']}
        storage={{ get: (k) => store.get(k) ?? null, set: (k, v) => void store.set(k, v) }}
      >
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('dark'));
    expect(store.get('lumen-theme')).toBe('dark');
  });

  it('throws when useTheme is called without a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
