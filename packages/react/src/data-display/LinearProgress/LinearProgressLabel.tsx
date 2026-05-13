import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressLabel } from './LinearProgress.css.js';

/** Props for the {@link LinearProgressLabel} leading text. */
export interface LinearProgressLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Label content — typically a short string like "Uploading files". */
  children?: ReactNode;
}

/** Leading text — e.g. "Uploading files". Rendered inside `LinearProgressHeader`. */
export function LinearProgressLabel({
  children,
  className,
  ...rest
}: LinearProgressLabelProps): ReactElement {
  return (
    <span className={cn(linearProgressLabel, className)} {...rest}>
      {children}
    </span>
  );
}
