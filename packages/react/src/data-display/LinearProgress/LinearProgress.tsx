import { type CSSProperties, type ReactElement, type ReactNode, forwardRef } from 'react';
import {
  type LinearProgressColorScheme,
  type LinearProgressCompletionState,
  type LinearProgressSize,
  type LinearProgressVariant,
} from './LinearProgressContext.js';
import { LinearProgressBuffer } from './LinearProgressBuffer.js';
import { LinearProgressHeader } from './LinearProgressHeader.js';
import { LinearProgressIndicator } from './LinearProgressIndicator.js';
import { LinearProgressLabel } from './LinearProgressLabel.js';
import { LinearProgressMeta } from './LinearProgressMeta.js';
import { LinearProgressRoot } from './LinearProgressRoot.js';
import { LinearProgressSegment } from './LinearProgressSegment.js';
import { LinearProgressTrack } from './LinearProgressTrack.js';
import { LinearProgressValue } from './LinearProgressValue.js';

export interface LinearProgressSegmentDescriptor {
  value: number;
  colorScheme?: LinearProgressColorScheme;
  label?: string;
}

export interface LinearProgressProps {
  /** Current progress value. Ignored when `indeterminate` or `segments` is set. */
  value?: number;
  max?: number;
  size?: LinearProgressSize;
  colorScheme?: LinearProgressColorScheme;
  variant?: LinearProgressVariant;
  indeterminate?: boolean;
  /** YouTube-style preloaded / reserved progress bar behind the indicator. */
  buffer?: number;
  /**
   * Stacked multi-value bar — mutually exclusive with plain `value`. Each
   * entry becomes a `<LinearProgressSegment>`.
   */
  segments?: LinearProgressSegmentDescriptor[];
  /** Renders the value readout below the track. */
  showValue?: boolean;
  /** Short label rendered above the track (left side). */
  label?: ReactNode;
  /** Trailing text above the track (right side) — speed, ETA, "12 of 20". */
  meta?: ReactNode;
  /** Override default `${pct}%` formatter. */
  formatValue?: (value: number, max: number) => string;
  completionState?: LinearProgressCompletionState;
  /** `aria-label` passthrough. When omitted, falls back to `label` if it's a string. */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Convenience wrapper — the everyday entry point. Composes the compound
 * primitives (`LinearProgressRoot`, `LinearProgressTrack`, etc.) behind flat
 * feature flags. Break out to the primitives directly when you need a
 * custom layout.
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(function LinearProgress(
  {
    value = 0,
    max = 100,
    size = 'md',
    colorScheme = 'accent',
    variant = 'solid',
    indeterminate = false,
    buffer,
    segments,
    showValue = false,
    label,
    meta,
    formatValue,
    completionState = 'auto',
    'aria-label': ariaLabel,
    className,
    style,
  },
  ref,
): ReactElement {
  const hasHeader = label !== undefined || meta !== undefined;
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined);

  return (
    <LinearProgressRoot
      ref={ref}
      value={value}
      max={max}
      size={size}
      colorScheme={colorScheme}
      variant={variant}
      indeterminate={indeterminate}
      completionState={completionState}
      formatValue={formatValue}
      aria-label={resolvedAriaLabel}
      className={className}
      style={style}
    >
      {hasHeader ? (
        <LinearProgressHeader>
          <LinearProgressLabel>{label}</LinearProgressLabel>
          <LinearProgressMeta>{meta}</LinearProgressMeta>
        </LinearProgressHeader>
      ) : null}
      <LinearProgressTrack>
        {segments !== undefined ? (
          segments.map((segment, index) => (
            <LinearProgressSegment
              // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional — index is the stable identity
              key={index}
              value={segment.value}
              colorScheme={segment.colorScheme ?? 'accent'}
              label={segment.label}
            />
          ))
        ) : (
          <>
            {buffer !== undefined ? <LinearProgressBuffer value={buffer} /> : null}
            <LinearProgressIndicator />
          </>
        )}
      </LinearProgressTrack>
      {showValue ? <LinearProgressValue /> : null}
    </LinearProgressRoot>
  );
});
