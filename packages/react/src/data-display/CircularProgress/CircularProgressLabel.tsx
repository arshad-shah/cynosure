import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { circularProgressLabel } from './CircularProgress.css.js';

/** Props for the {@link CircularProgressLabel} centred-content slot. */
export interface CircularProgressLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** The label content — usually the rendered percentage or a short word. */
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
