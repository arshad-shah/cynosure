import { type HTMLAttributes, type ReactElement, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  speedFast,
  speedNormal,
  speedSlow,
  spinnerBorder,
  spinnerColorAccent,
  spinnerColorCurrent,
  spinnerColorNeutral,
  spinnerDot,
  spinnerDots,
  spinnerRing,
  spinnerRingCircleProgress,
  spinnerRingCircleTrack,
  spinnerRoot,
  spinnerSize,
} from './Spinner.css.js';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColorScheme = 'accent' | 'neutral' | 'currentColor';
export type SpinnerVariant = 'border' | 'dots' | 'ring';
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'aria-label'> {
  size?: SpinnerSize;
  colorScheme?: SpinnerColorScheme;
  variant?: SpinnerVariant;
  speed?: SpinnerSpeed;
  label?: string;
}

const colorClass: Record<SpinnerColorScheme, string> = {
  accent: spinnerColorAccent,
  neutral: spinnerColorNeutral,
  currentColor: spinnerColorCurrent,
};

const speedClass: Record<SpinnerSpeed, string> = {
  slow: speedSlow,
  normal: speedNormal,
  fast: speedFast,
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    size = 'md',
    colorScheme = 'currentColor',
    variant = 'border',
    speed = 'normal',
    label = 'Loading',
    className,
    ...rest
  },
  ref,
) {
  const speedCls = speedClass[speed];

  let inner: ReactElement;
  if (variant === 'ring') {
    inner = (
      <svg viewBox="0 0 24 24" className={spinnerRing} aria-hidden="true">
        <circle cx="12" cy="12" r="10" className={spinnerRingCircleTrack} />
        <circle cx="12" cy="12" r="10" className={cn(spinnerRingCircleProgress, speedCls)} />
      </svg>
    );
  } else if (variant === 'dots') {
    inner = (
      <span aria-hidden="true" className={spinnerDots}>
        <span className={cn(spinnerDot, speedCls)} style={{ animationDelay: '-0.32s' }} />
        <span className={cn(spinnerDot, speedCls)} style={{ animationDelay: '-0.16s' }} />
        <span className={cn(spinnerDot, speedCls)} />
      </span>
    );
  } else {
    inner = <span aria-hidden="true" className={cn(spinnerBorder, speedCls)} />;
  }

  return (
    <span
      ref={ref}
      // biome-ignore lint/a11y/useSemanticElements: the Spinner must render inline inside buttons; `<output>` is block-level
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(spinnerRoot, spinnerSize[size], colorClass[colorScheme], className)}
      {...rest}
    >
      {inner}
    </span>
  );
});
