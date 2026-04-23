import { type ReactElement, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { counterCount, counterSeparator, counter as counterStyle } from './Textarea.css.js';
import { useTextareaContext } from './TextareaContext.js';

export interface TextareaCounterProps {
  /** Overrides the limit set on Root. */
  limit?: number;
  /** Warning threshold as a ratio of the limit. Default `0.8`. */
  warnAt?: number;
  className?: string;
}

/**
 * Live character count + limit badge. Enters a `warning` state at
 * `count >= limit * warnAt` and a `danger` state past the limit. When in
 * danger, registers over-limit on the Root so the field picks up
 * `aria-invalid` and the card switches to `data-invalid`.
 */
export function TextareaCounter({
  limit: limitProp,
  warnAt = 0.8,
  className,
}: TextareaCounterProps): ReactElement {
  const ctx = useTextareaContext();
  const limit = limitProp ?? ctx.limit;
  const count = ctx.value.length;

  const hasLimit = typeof limit === 'number' && limit > 0;
  const over = hasLimit && count > (limit as number);
  const warning = hasLimit && !over && count >= (limit as number) * warnAt;
  const state: 'default' | 'warning' | 'danger' = over ? 'danger' : warning ? 'warning' : 'default';

  useEffect(() => {
    ctx.setOverLimit(over);
    return () => {
      ctx.setOverLimit(false);
    };
  }, [over, ctx.setOverLimit]);

  return (
    <output
      data-testid="textarea-counter"
      data-state={state}
      aria-live="polite"
      className={cn(counterStyle, className)}
    >
      <strong className={counterCount}>{count}</strong>
      {hasLimit ? (
        <>
          <span className={counterSeparator} aria-hidden="true">
            /
          </span>
          <span>{limit}</span>
        </>
      ) : null}
    </output>
  );
}
