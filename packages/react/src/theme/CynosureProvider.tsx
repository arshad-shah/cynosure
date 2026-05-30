import type { ReactNode } from 'react';
import { TooltipProvider } from '../overlay/Tooltip/Tooltip.js';
import { DirectionProvider } from './DirectionProvider.js';
import { LocaleProvider } from './LocaleProvider.js';
import { ThemeProvider } from './ThemeProvider.js';
import type { Direction, DirectionProviderProps, ThemeProviderProps } from './types.js';

export interface CynosureProviderProps {
  children: ReactNode;
  /** Props forwarded to the inner `<ThemeProvider>`. */
  theme?: Omit<ThemeProviderProps, 'children'>;
  /** Props forwarded to the inner `<DirectionProvider>`, or a bare `dir` string. */
  direction?: Direction | Omit<DirectionProviderProps, 'children'>;
  /** BCP-47 locale forwarded to the inner `<LocaleProvider>`. */
  locale?: string;
  /** Global tooltip timing. */
  tooltip?: {
    /** Open delay in ms before any tooltip in the tree appears. Default 300. */
    delayDuration?: number;
    /** Time after leaving one tooltip during which the next opens instantly. Default 500. */
    skipDelayDuration?: number;
  };
}

/**
 * One-stop wrapper that composes every Cynosure context provider a typical app
 * needs: theme, direction (RTL), locale, and the global tooltip timing
 * provider. Drop it once at the root of your tree and every component "just
 * works".
 *
 * @example
 * ```tsx
 * <CynosureProvider theme={{ defaultTheme: 'system' }}>
 *   <App />
 * </CynosureProvider>
 * ```
 *
 * Everything is optional — pass only what you need to override. If you want
 * finer-grained control, keep composing `<ThemeProvider>`, `<DirectionProvider>`,
 * `<LocaleProvider>`, and `<TooltipProvider>` directly; this helper is purely
 * a convenience.
 */
export function CynosureProvider({
  children,
  theme,
  direction,
  locale,
  tooltip,
}: CynosureProviderProps) {
  const directionProps: Omit<DirectionProviderProps, 'children'> =
    typeof direction === 'string' ? { dir: direction } : (direction ?? {});

  return (
    <ThemeProvider {...theme}>
      <DirectionProvider {...directionProps}>
        <LocaleProvider locale={locale}>
          <TooltipProvider
            delayDuration={tooltip?.delayDuration ?? 300}
            skipDelayDuration={tooltip?.skipDelayDuration ?? 500}
          >
            {children}
          </TooltipProvider>
        </LocaleProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
