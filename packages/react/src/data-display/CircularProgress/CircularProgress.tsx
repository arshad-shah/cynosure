import { type CSSProperties, type ReactElement, type ReactNode, forwardRef } from 'react';
import {
  type CircularProgressColorScheme,
  type CircularProgressCompletionState,
  type CircularProgressSize,
} from './CircularProgressContext.js';
import { CircularProgressIndicator } from './CircularProgressIndicator.js';
import { CircularProgressLabel } from './CircularProgressLabel.js';
import { CircularProgressRoot } from './CircularProgressRoot.js';
import { CircularProgressTrack } from './CircularProgressTrack.js';

export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: CircularProgressSize;
  colorScheme?: CircularProgressColorScheme;
  thickness?: number;
  indeterminate?: boolean;
  completionState?: CircularProgressCompletionState;
  /** Centered content — typically the percentage or a short label. */
  children?: ReactNode;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Convenience wrapper — the everyday entry point. For custom layouts
 * (overlaid badges, multiple rings, etc.) break out to
 * `CircularProgressRoot` / `Track` / `Indicator` / `Label` directly.
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
