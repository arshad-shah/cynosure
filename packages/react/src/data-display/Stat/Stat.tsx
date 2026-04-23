import { TrendingDown, TrendingUp } from 'lucide-react';
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { statArrow, statHelp, statLabel, statRoot, statValue } from './Stat.css.js';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {}

export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(statRoot, className)} {...rest} />;
});

export interface StatLabelProps extends HTMLAttributes<HTMLParagraphElement> {}

export const StatLabel = forwardRef<HTMLParagraphElement, StatLabelProps>(function StatLabel(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statLabel, className)} {...rest} />;
});

export interface StatValueProps extends HTMLAttributes<HTMLParagraphElement> {}

export const StatValue = forwardRef<HTMLParagraphElement, StatValueProps>(function StatValue(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statValue, className)} {...rest} />;
});

export interface StatHelpProps extends HTMLAttributes<HTMLParagraphElement> {}

export const StatHelp = forwardRef<HTMLParagraphElement, StatHelpProps>(function StatHelp(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} className={cn(statHelp, className)} {...rest} />;
});

export type StatArrowDirection = 'increase' | 'decrease';

export interface StatArrowProps extends HTMLAttributes<HTMLSpanElement> {
  direction?: StatArrowDirection;
}

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
