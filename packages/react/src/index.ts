export const VERSION = '0.0.0';

export * from './hooks/index.js';
export * from './primitives/index.js';
export * from './utils/index.js';

export {
  DirectionProvider,
  ThemeProvider,
  getThemeInitScript,
  useColorScheme,
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
