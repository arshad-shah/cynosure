import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { cn } from '../../utils/cn.js';
import {
  linearProgressColorAccent,
  linearProgressColorDanger,
  linearProgressColorNeutral,
  linearProgressColorSuccess,
  linearProgressColorWarning,
  linearProgressSegment,
} from './LinearProgress.css.js';
import {
  type LinearProgressColorScheme,
  clampProgress,
  useLinearProgressContext,
} from './LinearProgressContext.js';

/** Props for a single {@link LinearProgressSegment} slice in a stacked bar. */
export interface LinearProgressSegmentProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  /** Segment share of the total. Clamped to `[0, max]` via the root's `max`. */
  value: number;
  /**
   * Colour role for this slice.
   * @default "accent"
   */
  colorScheme?: LinearProgressColorScheme;
  /** Accessible label announced for this slice. */
  label?: string;
}

const colorClass: Record<LinearProgressColorScheme, string> = {
  accent: linearProgressColorAccent,
  success: linearProgressColorSuccess,
  warning: linearProgressColorWarning,
  danger: linearProgressColorDanger,
  neutral: linearProgressColorNeutral,
};

/**
 * One slice of a stacked bar. Unlike `<LinearProgressIndicator>`, segments
 * participate in the track's flex layout — each segment's `value / max`
 * becomes its flex-basis, so they tile horizontally and leave blank space
 * for the unreserved remainder.
 */
export function LinearProgressSegment({
  value,
  colorScheme = 'accent',
  label,
  className,
  ...rest
}: LinearProgressSegmentProps): ReactElement {
  const { max } = useLinearProgressContext();
  const pct = max > 0 ? clampProgress(value, 0, max) / max : 0;
  const style: CSSProperties = { flex: `0 0 ${(pct * 100).toString()}%` };

  return (
    <span
      aria-label={label}
      className={cn(linearProgressSegment, colorClass[colorScheme], className)}
      style={style}
      {...rest}
    />
  );
}
