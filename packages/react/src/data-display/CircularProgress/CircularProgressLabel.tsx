import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { circularProgressLabel } from './CircularProgress.css.js';

export interface CircularProgressLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/**
 * Centered content slot overlaid on the ring — typically the percentage,
 * a short word like "Done", or a small icon.
 */
export function CircularProgressLabel({
  children,
  className,
  ...rest
}: CircularProgressLabelProps): ReactElement {
  return (
    <span className={cn(circularProgressLabel, className)} {...rest}>
      {children}
    </span>
  );
}
