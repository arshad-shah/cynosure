import { TrendingDown, TrendingUp } from 'lucide-react';
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { statArrow, statHelp, statLabel, statRoot, statValue } from './Stat.css.js';

/** Props for the {@link Stat} container that groups label, value, and helper text. */
export interface StatProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Stat groups a single key metric (label + value + optional trend helper) into
 * a compact block. Compose with {@link StatLabel}, {@link StatValue},
 * {@link StatHelp}, and {@link StatArrow}.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(statRoot, className)} {...rest} />;
});

/** Props for the descriptive caption above the metric value. */
export interface StatLabelProps extends HTMLAttributes<HTMLParagraphElement> {}

/** Short caption rendered above the {@link StatValue} (e.g. "Active users"). */
export const StatLabel = forwardRef<HTMLParagraphElement, StatLabelProps>(function StatLabel(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statLabel, className)} {...rest} />;
});

/** Props for the prominent numeric value of a {@link Stat}. */
export interface StatValueProps extends HTMLAttributes<HTMLParagraphElement> {}

/** The headline metric inside a {@link Stat}. Rendered in display-size type. */
export const StatValue = forwardRef<HTMLParagraphElement, StatValueProps>(function StatValue(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statValue, className)} {...rest} />;
});

/** Props for the helper line under a {@link StatValue} (typically the delta + period). */
export interface StatHelpProps extends HTMLAttributes<HTMLParagraphElement> {}

/** Helper line under {@link StatValue}, usually pairing a {@link StatArrow} with a delta description. */
export const StatHelp = forwardRef<HTMLParagraphElement, StatHelpProps>(function StatHelp(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statHelp, className)} {...rest} />;
});

export type StatArrowDirection = 'increase' | 'decrease';

/** Props for the trend arrow rendered inside {@link StatHelp}. */
export interface StatArrowProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Trend direction. `increase` renders an upward arrow, `decrease` a
   * downward arrow. Also drives the `aria-label` ("Increased by"/"Decreased by").
   * @default "increase"
   */
  direction?: StatArrowDirection;
}

/**
 * Trend indicator placed inside {@link StatHelp}. Renders a Lucide
 * `TrendingUp`/`TrendingDown` glyph by default; pass `children` to override.
 */
export const StatArrow = forwardRef<HTMLSpanElement, StatArrowProps>(function StatArrow(
  { direction = 'increase', className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      data-direction={direction}
      aria-label={direction === 'increase' ? 'Increased by' : 'Decreased by'}
      className={cn(statArrow, className)}
      {...rest}
    >
      {children ??
        (direction === 'increase' ? <TrendingUp size={'14'} /> : <TrendingDown size={'14'} />)}
    </span>
  );
});
