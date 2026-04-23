import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import {
  linearProgressColorAccent,
  linearProgressColorDanger,
  linearProgressColorNeutral,
  linearProgressColorSuccess,
  linearProgressColorWarning,
  linearProgressTrack,
  linearProgressTrackSize,
  linearProgressTrackTicked,
} from './LinearProgress.css.js';
import {
  type LinearProgressColorScheme,
  useLinearProgressContext,
} from './LinearProgressContext.js';

export interface LinearProgressTrackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const colorClass: Record<LinearProgressColorScheme, string> = {
  accent: linearProgressColorAccent,
  success: linearProgressColorSuccess,
  warning: linearProgressColorWarning,
  danger: linearProgressColorDanger,
  neutral: linearProgressColorNeutral,
};

/**
 * The recessed well. Paints the track background and inset shadows, then
 * renders its children (`Buffer`, `Indicator`, `Segment`, or nothing if
 * `indeterminate`). Track also owns the scheme variable — setting it here
 * means the gradient colour is inherited by all children, so a single
 * override on a compound `<LinearProgressIndicator colorScheme="success" />`
 * would be a follow-on if consumers need per-piece colours.
 */
export function LinearProgressTrack({
  children,
  className,
  ...rest
}: LinearProgressTrackProps): ReactElement {
  const { size, variant, colorScheme, isComplete } = useLinearProgressContext();
  const effectiveScheme: LinearProgressColorScheme = isComplete ? 'success' : colorScheme;

  return (
    <div
      className={cn(
        linearProgressTrack,
        linearProgressTrackSize[size],
        variant === 'ticked' ? linearProgressTrackTicked : undefined,
        colorClass[effectiveScheme],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
