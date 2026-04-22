import { describe, expect, it } from 'vitest';
import { THEMES, THEME_STORAGE_KEY, getThemeInitScript } from '../src/lib/theme-init';

describe('theme-init', () => {
  it('returns an IIFE string', () => {
    const s = getThemeInitScript();
    expect(s.startsWith('(() => {')).toBe(true);
    expect(s.trim().endsWith('})();')).toBe(true);
    expect(s).toContain(THEME_STORAGE_KEY);
  });
  it('enumerates light, dark and system themes', () => {
    expect(THEMES).toEqual(['light', 'dark', 'system']);
  });
});
