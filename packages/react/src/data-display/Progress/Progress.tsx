import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  circleContent,
  circleProgress,
  circleRoot,
  circleSize,
  circleSvg,
  circleSvgIndeterminate,
  circleTrack,
  progressColorAccent,
  progressColorDanger,
  progressColorNeutral,
  progressColorSuccess,
  progressColorWarning,
  progressIndeterminateIndicator,
  progressIndicator,
  progressRoot,
  progressStriped,
  progressStripedAnimated,
  progressTrack,
  progressTrackSize,
  progressValueLabel,
} from './Progress.css.js';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressColorScheme = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
export type ProgressCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  value?: number;
  max?: number;
  size?: ProgressSize;
  colorScheme?: ProgressColorScheme;
  showValue?: boolean;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
  label?: string;
  /** Optional custom formatter for the displayed value. */
  formatValue?: (value: number, max: number) => string;
}

const colorClass: Record<ProgressColorScheme, string> = {
  accent: progressColorAccent,
  success: progressColorSuccess,
  warning: progressColorWarning,
  danger: progressColorDanger,
  neutral: progressColorNeutral,
};

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    max = 100,
    size = 'md',
    colorScheme = 'accent',
    showValue = false,
    indeterminate = false,
    striped = false,
    animated = false,
    label,
    formatValue,
    className,
    ...rest
  },
  ref,
) {
  const pct = max > 0 ? (clamp(value, 0, max) / max) * 100 : 0;

  const indicatorStyle: CSSProperties = indeterminate
    ? {}
    : { transform: `scaleX(${(pct / 100).toString()})` };

  const formatted = formatValue
    ? formatValue(value, max)
    : `${Math.round((pct + Number.EPSILON) * 10) / 10}%`;

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: progressbar is a live region, not a focusable control.
    // biome-ignore lint/a11y/useSemanticElements: `<output>` doesn't accept the progressbar role; a `<div>` is the common pattern (matches WAI-ARIA APG).
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : clamp(value, 0, max)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={indeterminate ? undefined : formatted}
      className={cn(progressRoot, className)}
      {...rest}
    >
      <div className={cn(progressTrack, progressTrackSize[size])}>
        {indeterminate ? (
          <span
            aria-hidden="true"
            className={cn(progressIndeterminateIndicator, colorClass[colorScheme])}
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              progressIndicator,
              colorClass[colorScheme],
              striped ? progressStriped : undefined,
              striped && animated ? progressStripedAnimated : undefined,
            )}
            style={indicatorStyle}
          />
        )}
      </div>
      {showValue && !indeterminate ? <span className={progressValueLabel}>{formatted}</span> : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* ProgressCircle                                                      */
/* ------------------------------------------------------------------ */

export interface ProgressCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  value?: number;
  max?: number;
  size?: ProgressCircleSize;
  thickness?: number;
  colorScheme?: ProgressColorScheme;
  indeterminate?: boolean;
  label?: string;
  children?: ReactNode;
}

const circleColorStroke: Record<ProgressColorScheme, string> = {
  accent: 'var(--lumen-color-accent-solid)',
  success: 'var(--lumen-color-feedback-success-solid)',
  warning: 'var(--lumen-color-feedback-warning-solid)',
  danger: 'var(--lumen-color-feedback-danger-solid)',
  neutral: 'var(--lumen-color-foreground-muted)',
};

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  function ProgressCircle(
    {
      value = 0,
      max = 100,
      size = 'md',
      thickness = 4,
      colorScheme = 'accent',
      indeterminate = false,
      label,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const pct = max > 0 ? clamp(value, 0, max) / max : 0;
    // viewBox is 36×36 so circumference ~= 2πr where r = 16 (leaves 2 units of padding for stroke)
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - pct);

    return (
      // biome-ignore lint/a11y/useFocusableInteractive: progressbar is a live region, not a focusable control.
      // biome-ignore lint/a11y/useSemanticElements: `<output>` doesn't accept the progressbar role; a `<div>` is the common pattern.
      <div
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuenow={indeterminate ? undefined : clamp(value, 0, max)}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(circleRoot, circleSize[size], className)}
        {...rest}
      >
        <svg
          viewBox="0 0 36 36"
          className={cn(circleSvg, indeterminate ? circleSvgIndeterminate : undefined)}
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r={radius} strokeWidth={thickness} className={circleTrack} />
          <circle
            cx="18"
            cy="18"
            r={radius}
            strokeWidth={thickness}
            className={circleProgress}
            stroke={circleColorStroke[colorScheme]}
            strokeDasharray={
              indeterminate
                ? `${(circumference / 3).toString()} ${circumference.toString()}`
                : circumference.toString()
            }
            strokeDashoffset={indeterminate ? 0 : dashOffset}
          />
        </svg>
        {children !== undefined ? <span className={circleContent}>{children}</span> : null}
      </div>
    );
  },
);
