import { useThemeContext } from '../ThemeProvider.js';
import type { ColorScheme } from '../types.js';

/**
 * Returns the active colour scheme ("light" or "dark"). Useful when a
 * component needs to fork its render based on light/dark — e.g. swapping a
 * logo asset. For styling, prefer CSS custom properties over branching here.
 */
export function useColorScheme(): ColorScheme {
  return useThemeContext().colorScheme;
}
