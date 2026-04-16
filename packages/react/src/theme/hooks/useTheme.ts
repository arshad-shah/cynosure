import { useThemeContext } from '../ThemeProvider.js';
import type { ThemeContextValue } from '../types.js';

/**
 * Read and update the active theme. Throws if used outside `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  return useThemeContext();
}
