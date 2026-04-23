import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressRoot } from './LinearProgress.css.js';
import {
  type LinearProgressColorScheme,
  type LinearProgressCompletionState,
  LinearProgressContextProvider,
  type LinearProgressContextValue,
  type LinearProgressSize,
  type LinearProgressVariant,
  clampProgress,
} from './LinearProgressContext.js';

export interface LinearProgressRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Current progress value. Clamped to `[0, max]` internally. */
  value?: number;
  max?: number;
  size?: LinearProgressSize;
  colorScheme?: LinearProgressColorScheme;
  variant?: LinearProgressVariant;
  indeterminate?: boolean;
  /**
   * When `auto` (default), reaching `max` flips the indicator + value to a
   * "done" treatment. Set to `"none"` to keep the raw fill at 100%.
   */
  completionState?: LinearProgressCompletionState;
  /** Override the default `${pct}%` value formatter. */
  formatValue?: (value: number, max: number) => string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Compound primitive. Owns progress state and provides it to the other
 * sub-components (`LinearProgressTrack`, `LinearProgressIndicator`,
 * `LinearProgressBuffer`, `LinearProgressSegment`, `LinearProgressValue`,
 * `LinearProgressHeader` / `Label` / `Meta`).
 *
 * The root itself carries `role="progressbar"` and the ARIA value attributes —
 * nested elements stay pure presentation. This matches the WAI-ARIA APG
 * recommendation and keeps a single accessible name for the whole group.
 */
export const LinearProgressRoot = forwardRef<HTMLDivElement, LinearProgressRootProps>(
  function LinearProgressRoot(
    {
      value = 0,
      max = 100,
      size = 'md',
      colorScheme = 'accent',
      variant = 'solid',
      indeterminate = false,
      completionState = 'auto',
      formatValue,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const clamped = clampProgress(value, 0, max);
    const isComplete = !indeterminate && completionState === 'auto' && max > 0 && clamped >= max;

    const ctx = useMemo<LinearProgressContextValue>(
      () => ({
        value: clamped,
        max,
        size,
        variant,
        colorScheme,
        indeterminate,
        isComplete,
        completionState,
        formatValue,
      }),
      [
        clamped,
        max,
        size,
        variant,
        colorScheme,
        indeterminate,
        isComplete,
        completionState,
        formatValue,
      ],
    );

    return (
      <LinearProgressContextProvider value={ctx}>
        {/* biome-ignore lint/a11y/useFocusableInteractive: progressbar is a live region, not a focusable control. */}
        {/* biome-ignore lint/a11y/useSemanticElements: `<output>` doesn't accept the progressbar role; a `<div>` is the common pattern (WAI-ARIA APG). */}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={
            indeterminate
              ? undefined
              : formatValue
                ? formatValue(clamped, max)
                : `${Math.round((clamped / max) * 100).toString()}%`
          }
          data-complete={isComplete || undefined}
          data-indeterminate={indeterminate || undefined}
          className={cn(linearProgressRoot, className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </LinearProgressContextProvider>
    );
  },
);
