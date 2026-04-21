import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { circularProgressRoot, circularProgressSize } from './CircularProgress.css.js';
import {
  type CircularProgressColorScheme,
  type CircularProgressCompletionState,
  CircularProgressContextProvider,
  type CircularProgressContextValue,
  type CircularProgressSize,
  clampProgress,
} from './CircularProgressContext.js';

const FIXED_RADIUS = 16;
const FIXED_CIRCUMFERENCE = 2 * Math.PI * FIXED_RADIUS;

export interface CircularProgressRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  value?: number;
  max?: number;
  size?: CircularProgressSize;
  colorScheme?: CircularProgressColorScheme;
  /** Ring stroke-width (SVG units). Default `4`. */
  thickness?: number;
  indeterminate?: boolean;
  completionState?: CircularProgressCompletionState;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Compound primitive. Owns progress state and the fixed SVG viewBox geometry.
 * Provides `radius`, `circumference`, and `thickness` via context so the
 * `Track` and `Indicator` primitives can render into the same SVG without
 * duplicating the dashoffset maths.
 */
export const CircularProgressRoot = forwardRef<HTMLDivElement, CircularProgressRootProps>(
  function CircularProgressRoot(
    {
      value = 0,
      max = 100,
      size = 'md',
      colorScheme = 'accent',
      thickness = 4,
      indeterminate = false,
      completionState = 'auto',
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const clamped = clampProgress(value, 0, max);
    const isComplete = !indeterminate && completionState === 'auto' && max > 0 && clamped >= max;

    const ctx = useMemo<CircularProgressContextValue>(
      () => ({
        value: clamped,
        max,
        size,
        colorScheme,
        thickness,
        indeterminate,
        isComplete,
        completionState,
        radius: FIXED_RADIUS,
        circumference: FIXED_CIRCUMFERENCE,
      }),
      [clamped, max, size, colorScheme, thickness, indeterminate, isComplete, completionState],
    );

    return (
      <CircularProgressContextProvider value={ctx}>
        {/* biome-ignore lint/a11y/useFocusableInteractive: progressbar is a live region, not a focusable control. */}
        {/* biome-ignore lint/a11y/useSemanticElements: `<output>` doesn't accept the progressbar role; a `<div>` is the common pattern. */}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={
            indeterminate ? undefined : `${Math.round((clamped / max) * 100).toString()}%`
          }
          data-complete={isComplete || undefined}
          data-indeterminate={indeterminate || undefined}
          className={cn(circularProgressRoot, circularProgressSize[size], className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </CircularProgressContextProvider>
    );
  },
);
