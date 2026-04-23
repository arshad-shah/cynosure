import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { cn } from '../../utils/cn.js';
import {
  linearProgressIndeterminate,
  linearProgressIndeterminateBar1,
  linearProgressIndeterminateBar2,
  linearProgressIndicator,
  linearProgressIndicatorComplete,
} from './LinearProgress.css.js';
import { useLinearProgressContext } from './LinearProgressContext.js';

export type LinearProgressIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'style'>;

/**
 * Primary progress fill. In determinate mode, `scaleX` animates from the
 * start edge to `value / max`. In indeterminate mode, two asymmetric bars
 * traverse the track (MUI's motion pattern — reads as "working" rather
 * than "loading").
 */
export function LinearProgressIndicator({
  className,
  ...rest
}: LinearProgressIndicatorProps): ReactElement {
  const { value, max, indeterminate, isComplete } = useLinearProgressContext();

  if (indeterminate) {
    return (
      <span aria-hidden="true" className={cn(linearProgressIndeterminate, className)} {...rest}>
        <span className={linearProgressIndeterminateBar1} />
        <span className={linearProgressIndeterminateBar2} />
      </span>
    );
  }

  const pct = max > 0 ? value / max : 0;
  const style: CSSProperties = { transform: `scaleX(${pct.toString()})` };

  return (
    <span
      aria-hidden="true"
      className={cn(
        linearProgressIndicator,
        isComplete ? linearProgressIndicatorComplete : undefined,
        className,
      )}
      style={style}
      {...rest}
    />
  );
}
