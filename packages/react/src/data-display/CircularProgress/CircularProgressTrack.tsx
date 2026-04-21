import type { ReactElement, SVGAttributes } from 'react';
import { cn } from '../../utils/cn.js';
import {
  circularProgressColorAccent,
  circularProgressColorDanger,
  circularProgressColorNeutral,
  circularProgressColorSuccess,
  circularProgressColorWarning,
  circularProgressSvg,
  circularProgressSvgIndeterminate,
  circularProgressTrack,
} from './CircularProgress.css.js';
import {
  type CircularProgressColorScheme,
  useCircularProgressContext,
} from './CircularProgressContext.js';

export type CircularProgressTrackProps = SVGAttributes<SVGCircleElement>;

const colorClass: Record<CircularProgressColorScheme, string> = {
  accent: circularProgressColorAccent,
  success: circularProgressColorSuccess,
  warning: circularProgressColorWarning,
  danger: circularProgressColorDanger,
  neutral: circularProgressColorNeutral,
};

/**
 * Renders the outer `<svg>` wrapper and the track `<circle>`. Children
 * (typically `<CircularProgressIndicator>`) are placed inside the same
 * SVG so they share viewBox units. Scheme classes live on the svg root
 * so the indicator can consume the solid-colour CSS variable.
 */
export function CircularProgressTrack({
  className,
  children,
  ...rest
}: CircularProgressTrackProps & { children?: React.ReactNode }): ReactElement {
  const { radius, thickness, indeterminate, colorScheme, isComplete } =
    useCircularProgressContext();
  const effectiveScheme: CircularProgressColorScheme = isComplete ? 'success' : colorScheme;

  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={cn(
        circularProgressSvg,
        indeterminate ? circularProgressSvgIndeterminate : undefined,
        colorClass[effectiveScheme],
      )}
    >
      <circle
        cx="18"
        cy="18"
        r={radius}
        strokeWidth={thickness}
        className={cn(circularProgressTrack, className)}
        {...rest}
      />
      {children}
    </svg>
  );
}
