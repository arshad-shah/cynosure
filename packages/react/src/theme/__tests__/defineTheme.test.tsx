import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { ThemeProvider } from '../ThemeProvider.js';
import { defineTheme } from '../defineTheme.js';
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

describe('defineTheme', () => {
  it('serializes typed tokens to a [data-theme] block with the right var names', () => {
    const ocean = defineTheme(
      'ocean',
      {
        color: {
          accent: { solid: '#0ea5e9', onSolid: '#ffffff' },
          background: { canvas: '#0b1220' },
        },
        radius: { component: { md: '10px' } },
      },
      { colorScheme: 'dark' },
    );

    expect(ocean.name).toBe('ocean');
    expect(ocean.colorScheme).toBe('dark');
    expect(ocean.css).toContain('[data-theme="ocean"]{');
    // camelCase → kebab, matching the generated token names.
    expect(ocean.css).toContain('--cynosure-color-accent-solid:#0ea5e9');
    expect(ocean.css).toContain('--cynosure-color-accent-on-solid:#ffffff');
    expect(ocean.css).toContain('--cynosure-color-background-canvas:#0b1220');
    expect(ocean.css).toContain('--cynosure-radius-component-md:10px');
  });

  it('defaults colorScheme to light', () => {
    expect(defineTheme('x', {}).colorScheme).toBe('light');
  });

  it('strips characters that could break out of the attribute selector', () => {
    const t = defineTheme('a"]{evil', { color: { accent: { solid: 'red' } } });
    expect(t.css.startsWith('[data-theme="aevil"]{')).toBe(true);
  });
});

describe('ThemeProvider + customThemes', () => {
  const ocean = defineTheme(
    'ocean',
    { color: { accent: { solid: '#0ea5e9' } } },
    { colorScheme: 'dark' },
  );

  it('injects the custom theme CSS as a <style> tag', () => {
    const { container } = render(
      <ThemeProvider defaultTheme="light" customThemes={[ocean]}>
        <span>hi</span>
      </ThemeProvider>,
    );
    const style = container.querySelector('style[data-cynosure-theme="ocean"]');
    expect(style).not.toBeNull();
    expect(style?.innerHTML).toContain('--cynosure-color-accent-solid:#0ea5e9');
  });

  it('registers the custom theme name so setTheme + colorScheme work', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" customThemes={[ocean]}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(result.current.themes).toContain('ocean');

    act(() => result.current.setTheme('ocean'));

    expect(result.current.theme).toBe('ocean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
    // Uses the scheme declared in defineTheme, not the name heuristic.
    expect(result.current.colorScheme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('ignores setTheme for a name that is neither built-in nor custom', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light" themes={['light', 'dark']} customThemes={[ocean]}>
          {children}
        </ThemeProvider>
      ),
    });
    act(() => result.current.setTheme('does-not-exist'));
    expect(result.current.theme).toBe('light'); // falls back to default
  });
});
