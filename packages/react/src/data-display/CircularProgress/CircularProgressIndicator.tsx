import type { ReactElement, SVGAttributes } from 'react';
import { cn } from '../../utils/cn.js';
import { circularProgressIndicator } from './CircularProgress.css.js';
import { useCircularProgressContext } from './CircularProgressContext.js';

export type CircularProgressIndicatorProps = SVGAttributes<SVGCircleElement>;

/**
 * The animated ring. In determinate mode, `stroke-dashoffset` transitions
 * smoothly as `value / max` changes. In indeterminate mode, a fixed arc
 * spins via the parent SVG's rotate animation.
 */
export function CircularProgressIndicator({
  className,
  ...rest
}: CircularProgressIndicatorProps): ReactElement {
  const { value, max, thickness, radius, circumference, indeterminate } =
    useCircularProgressContext();

  const pct = max > 0 ? value / max : 0;
  const strokeDasharray = indeterminate
    ? `${(circumference / 3).toString()} ${circumference.toString()}`
    : circumference.toString();
  const strokeDashoffset = indeterminate ? 0 : circumference * (1 - pct);

  return (
    <circle
      cx="18"
      cy="18"
      r={radius}
      strokeWidth={thickness}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      className={cn(circularProgressIndicator, className)}
      {...rest}
    />
  );
}
