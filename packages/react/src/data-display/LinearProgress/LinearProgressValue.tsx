import { Check } from 'lucide-react';
import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressValue, linearProgressValueComplete } from './LinearProgress.css.js';
import { useLinearProgressContext } from './LinearProgressContext.js';

/** Props for the {@link LinearProgressValue} formatted readout. */
export interface LinearProgressValueProps extends HTMLAttributes<HTMLSpanElement> {
  /** Override the default formatted output. Receives `(value, max)` and wins over the root's `formatValue`. */
  format?: (value: number, max: number) => string;
}

/**
 * Formatted value readout — "60%" by default, or whatever `format` /
 * root-level `formatValue` returns. On completion, shows a `<Check>` icon
 * plus "Done" in success colour (unless the root set `completionState="none"`).
 */
export function LinearProgressValue({
  format,
  className,
  children,
  ...rest
}: LinearProgressValueProps): ReactElement | null {
  const { value, max, indeterminate, isComplete, formatValue } = useLinearProgressContext();
  if (indeterminate) return null;

  const resolvedFormat = format ?? formatValue;
  const formatted = resolvedFormat
    ? resolvedFormat(value, max)
    : `${Math.round((value / max) * 1000) / 10}%`;

  return (
    <span
      className={cn(
        linearProgressValue,
        isComplete ? linearProgressValueComplete : undefined,
        className,
      )}
      {...rest}
    >
      {children ?? (
        <>
          {isComplete ? <Check aria-hidden="true" size="1em" strokeWidth={3} /> : null}
          {isComplete ? 'Done' : formatted}
        </>
      )}
    </span>
  );
}
