import { type CSSProperties, type ReactElement, type ReactNode, forwardRef } from 'react';
import type {
  CircularProgressColorScheme,
  CircularProgressCompletionState,
  CircularProgressSize,
} from './CircularProgressContext.js';
import { CircularProgressIndicator } from './CircularProgressIndicator.js';
import { CircularProgressLabel } from './CircularProgressLabel.js';
import { CircularProgressRoot } from './CircularProgressRoot.js';
import { CircularProgressTrack } from './CircularProgressTrack.js';

/** Props for the all-in-one {@link CircularProgress} wrapper. */
export interface CircularProgressProps {
  /**
   * Current progress value (0–`max`). Ignored when `indeterminate` is true.
   * @default 0
   */
  value?: number;
  /**
   * Upper bound used to compute the filled arc percentage.
   * @default 100
   */
  max?: number;
  /**
   * Preset diameter token (e.g. `sm`/`md`/`lg`). Maps to a fixed pixel size
   * in the CSS.
   * @default "md"
   */
  size?: CircularProgressSize;
  /**
   * Indicator colour role: `accent` (brand), `success`, `warning`, `danger`,
   * or `neutral`.
   * @default "accent"
   */
  colorScheme?: CircularProgressColorScheme;
  /**
   * Stroke width of both track and indicator, in pixels.
   * @default 4
   */
  thickness?: number;
  /**
   * Render the looping spinner animation instead of a value-driven arc.
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Override completion-state styling: `auto` flips to success colours once
   * `value === max`; `error` paints the danger colour scheme regardless.
   * @default "auto"
   */
  completionState?: CircularProgressCompletionState;
  /** Centered content — typically the percentage or a short label. */
  children?: ReactNode;
  /** Accessible label for screen readers when no visible label is supplied. */
  'aria-label'?: string;
  /** Additional class applied to the root element. */
  className?: string;
  /** Additional inline styles merged onto the root. */
  style?: CSSProperties;
}

/**
 * Convenience wrapper — the everyday entry point. Renders a Radix
 * `Progress`-style ring with optional centred label. Sets
 * `role="progressbar"` and `aria-valuenow`/`aria-valuemax` via the underlying
 * root. For custom layouts (overlaid badges, multiple rings, etc.) break out
 * to `CircularProgressRoot` / `Track` / `Indicator` / `Label` directly.
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(
    {
      value = 0,
      max = 100,
      size = 'md',
      colorScheme = 'accent',
      thickness = 4,
      indeterminate = false,
      completionState = 'auto',
      children,
      'aria-label': ariaLabel,
      className,
      style,
    },
    ref,
  ): ReactElement {
    return (
      <CircularProgressRoot
        ref={ref}
        value={value}
        max={max}
        size={size}
        colorScheme={colorScheme}
        thickness={thickness}
        indeterminate={indeterminate}
        completionState={completionState}
        aria-label={ariaLabel}
        className={className}
        style={style}
      >
        <CircularProgressTrack>
          <CircularProgressIndicator />
        </CircularProgressTrack>
        {children !== undefined ? <CircularProgressLabel>{children}</CircularProgressLabel> : null}
      </CircularProgressRoot>
    );
  },
);
