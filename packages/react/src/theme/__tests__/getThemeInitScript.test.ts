import { describe, expect, it } from 'vitest';
import { getThemeInitScript } from '../getThemeInitScript.js';

describe('getThemeInitScript', () => {
  it('produces a self-invoking IIFE on a single line', () => {
    const script = getThemeInitScript();
    expect(script.startsWith('(function()')).toBe(true);
    expect(script.endsWith(')();')).toBe(true);
    expect(script.includes('\n')).toBe(false);
  });

  it('reads from the provided storageKey and falls back to default', () => {
    const script = getThemeInitScript({
      defaultTheme: 'dark',
      storageKey: 'app-theme',
      attribute: 'data-mode',
    });
    expect(script.includes('"app-theme"')).toBe(true);
    expect(script.includes('"data-mode"')).toBe(true);
    expect(script.includes('"dark"')).toBe(true);
  });

  it('respects a null storage option', () => {
    const script = getThemeInitScript({ storage: null });
    expect(script.includes('localStorage')).toBe(false);
    expect(script.includes('sessionStorage')).toBe(false);
  });

  it('includes the allowlist when `themes` is provided', () => {
    const script = getThemeInitScript({ themes: ['light', 'dark', 'forest'] });
    expect(script.includes('"forest"')).toBe(true);
    expect(script.includes('["light","dark","forest"]')).toBe(true);
  });

  it('disables matchMedia resolution when enableSystem is false', () => {
    const script = getThemeInitScript({ defaultTheme: 'system', enableSystem: false });
    // The compiled script encodes the enableSystem flag inline.
    expect(script.includes('false&&window.matchMedia')).toBe(true);
  });

  it('resolves to "light" when system theme is requested but matchMedia is missing', () => {
    const script = getThemeInitScript({ defaultTheme: 'system' });
    // Run the script in isolated globals to verify behaviour without window.matchMedia.
    const html: { attrs: Record<string, string>; style: Record<string, string> } = {
      attrs: {},
      style: {},
    };
    const sandbox = {
      document: {
        documentElement: {
          setAttribute: (k: string, v: string) => {
            html.attrs[k] = v;
          },
          style: html.style,
        },
      },
      window: { localStorage: { getItem: () => null } },
    };
    new Function('window', 'document', script)(sandbox.window, sandbox.document);
    expect(html.attrs['data-theme']).toBe('light');
    expect(html.style.colorScheme).toBe('light');
  });
});
