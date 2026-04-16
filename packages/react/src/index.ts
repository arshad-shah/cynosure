export const VERSION = '0.0.0';

export {
  DirectionProvider,
  ThemeProvider,
  getThemeInitScript,
  useBreakpoint,
  useColorScheme,
  useDirection,
  useReducedMotion,
  useTheme,
} from './theme/index.js';
export type {
  Breakpoint,
  ColorScheme,
  Direction,
  DirectionContextValue,
  DirectionProviderProps,
  ResponsiveValue,
  StorageAdapter,
  ThemeContextValue,
  ThemeInitScriptOptions,
  ThemeProviderProps,
} from './theme/index.js';
