import { type CSSProperties, type ReactElement, type ReactNode, forwardRef } from 'react';
import { LinearProgressBuffer } from './LinearProgressBuffer.js';
import type {
  LinearProgressColorScheme,
  LinearProgressCompletionState,
  LinearProgressSize,
  LinearProgressVariant,
} from './LinearProgressContext.js';
import { LinearProgressHeader } from './LinearProgressHeader.js';
import { LinearProgressIndicator } from './LinearProgressIndicator.js';
import { LinearProgressLabel } from './LinearProgressLabel.js';
import { LinearProgressMeta } from './LinearProgressMeta.js';
import { LinearProgressRoot } from './LinearProgressRoot.js';
import { LinearProgressSegment } from './LinearProgressSegment.js';
import { LinearProgressTrack } from './LinearProgressTrack.js';
import { LinearProgressValue } from './LinearProgressValue.js';

/** Describes one segment of a stacked {@link LinearProgress}. */
export interface LinearProgressSegmentDescriptor {
  /** Segment magnitude (added to the running total; capped at `max`). */
  value: number;
  /**
   * Colour role for this segment.
   * @default "accent"
   */
  colorScheme?: LinearProgressColorScheme;
  /** Accessible label announced when this segment receives focus / hover. */
  label?: string;
}

/** Props for the all-in-one {@link LinearProgress} wrapper. */
export interface LinearProgressProps {
  /**
   * Current progress value. Ignored when `indeterminate` or `segments` is set.
   * @default 0
   */
  value?: number;
  /**
   * Upper bound used to compute the filled percentage.
   * @default 100
   */
  max?: number;
  /**
   * Height/font preset for the bar.
   * @default "md"
   */
  size?: LinearProgressSize;
  /**
   * Colour role for the filled portion.
   * @default "accent"
   */
  colorScheme?: LinearProgressColorScheme;
  /**
   * Visual treatment: `solid` (flat colour) or `striped` (animated stripes).
   * @default "solid"
   */
  variant?: LinearProgressVariant;
  /**
   * Render the indeterminate loop animation instead of a value-driven fill.
   * @default false
   */
  indeterminate?: boolean;
  /** YouTube-style preloaded / reserved progress bar behind the indicator. */
  buffer?: number;
  /**
   * Stacked multi-value bar — mutually exclusive with plain `value`. Each
   * entry becomes a `<LinearProgressSegment>`.
   */
  segments?: LinearProgressSegmentDescriptor[];
  /**
   * Render the formatted value below the track.
   * @default false
   */
  showValue?: boolean;
  /** Short label rendered above the track (left side). */
  label?: ReactNode;
  /** Trailing text above the track (right side) — speed, ETA, "12 of 20". */
  meta?: ReactNode;
  /** Override the default `${pct}%` formatter used by {@link LinearProgressValue}. */
  formatValue?: (value: number, max: number) => string;
  /**
   * `auto` flips to the success palette once full; `error` forces the danger palette.
   * @default "auto"
   */
  completionState?: LinearProgressCompletionState;
  /** `aria-label` passthrough. When omitted, falls back to `label` if it's a string. */
  'aria-label'?: string;
  /** Additional class applied to the root element. */
  className?: string;
  /** Additional inline styles merged onto the root. */
  style?: CSSProperties;
}

/**
 * Convenience wrapper — the everyday entry point. Renders a horizontal
 * progress bar with optional label/meta header, a buffer indicator, multiple
 * segments, and a formatted value readout. Composes the compound primitives
 * (`LinearProgressRoot`, `LinearProgressTrack`, etc.) behind flat feature
 * flags. Break out to the primitives directly when you need a custom layout.
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
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
    const resolvedAriaLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);

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
  },
);
