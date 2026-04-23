import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressLabel } from './LinearProgress.css.js';

export interface LinearProgressLabelProps extends HTMLAttributes<HTMLSpanElement> {
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
