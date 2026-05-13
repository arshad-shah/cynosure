import { Loader2, LoaderCircle } from 'lucide-react';
import { type HTMLAttributes, type ReactElement, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  speedFast,
  speedNormal,
  speedSlow,
  spinnerColorAccent,
  spinnerColorCurrent,
  spinnerColorNeutral,
  spinnerDot,
  spinnerDots,
  spinnerLucide,
  spinnerRoot,
  spinnerSize,
} from './Spinner.css.js';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColorScheme = 'accent' | 'neutral' | 'currentColor';
export type SpinnerVariant = 'border' | 'dots' | 'ring';
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

/** Props for the {@link Spinner} loading indicator. */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'aria-label'> {
  /**
   * Diameter token (xs–xl).
   * @default "md"
   */
  size?: SpinnerSize;
  /**
   * Colour role: `accent` for brand emphasis, `neutral` for muted, or
   * `currentColor` to inherit from the parent text colour.
   * @default "currentColor"
   */
  colorScheme?: SpinnerColorScheme;
  /**
   * Visual style. `border` is the spinning ring; `dots` is the pulsing
   * three-dot cluster; `ring` is a tighter solid arc.
   * @default "border"
   */
  variant?: SpinnerVariant;
  /**
   * Rotation/cycle speed token.
   * @default "normal"
   */
  speed?: SpinnerSpeed;
  /**
   * Accessible label announced via `aria-label` on the `role="status"` host.
   * @default "Loading"
   */
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

/**
 * Spinner is an indeterminate loading indicator. Renders inline (`<span>`) so
 * it can sit inside buttons or alongside text. Carries `role="status"` /
 * `aria-live="polite"` with a customisable label for screen readers.
 */
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
  if (variant === 'dots') {
    inner = (
      <span aria-hidden="true" className={spinnerDots}>
        <span className={cn(spinnerDot, speedCls)} style={{ animationDelay: '-0.32s' }} />
        <span className={cn(spinnerDot, speedCls)} style={{ animationDelay: '-0.16s' }} />
        <span className={cn(spinnerDot, speedCls)} />
      </span>
    );
  } else if (variant === 'ring') {
    inner = (
      <LoaderCircle aria-hidden="true" strokeWidth={2.25} className={cn(spinnerLucide, speedCls)} />
    );
  } else {
    inner = (
      <Loader2 aria-hidden="true" strokeWidth={2.25} className={cn(spinnerLucide, speedCls)} />
    );
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
