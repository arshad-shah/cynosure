import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressMeta } from './LinearProgress.css.js';

/** Props for the {@link LinearProgressMeta} trailing text. */
export interface LinearProgressMetaProps extends HTMLAttributes<HTMLSpanElement> {
  /** Meta content — typically a short throughput / ETA / counter string. */
  children?: ReactNode;
}

/**
 * Trailing text — e.g. "2.4 MB/s · 12s left" or "12 of 20 files".
 * Right-aligned inside `LinearProgressHeader` with tabular numerals so the
 * numbers don't jitter as values tick up.
 */
export function LinearProgressMeta({
  children,
  className,
  ...rest
}: LinearProgressMetaProps): ReactElement {
  return (
    <span className={cn(linearProgressMeta, className)} {...rest}>
      {children}
    </span>
  );
}
