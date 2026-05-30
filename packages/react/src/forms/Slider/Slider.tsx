import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Slider as AriaSlider,
  SliderOutput as AriaSliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import {
  fill,
  headerRow,
  markDot,
  markLabel,
  markWrap,
  marksRow,
  root,
  thumb,
  track,
  trackSize,
  valueLabel,
} from './Slider.css.js';

/** Single tick mark rendered along the slider track. */
export interface SliderMark {
  /** Position of the mark on the slider's value axis. */
  value: number;
  /** Optional caption rendered below the dot. */
  label?: ReactNode;
}

/** Cynosure-specific props for `<Slider>` (excludes React Aria's internal props). */
export interface SliderOwnProps {
  /** Visible label rendered above the track. Also used as the thumb's accessible name when a string. */
  label?: ReactNode;
  /**
   * Track size.
   * @default "md"
   */
  size?: FormControlSize;
  /** Tick marks along the track. */
  marks?: ReadonlyArray<SliderMark>;
  /** Show the current value (or `'tooltip'` to show it on the thumb only). */
  showValue?: boolean | 'tooltip';
  /** Intl format options passed to React Aria for locale-aware display. */
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  style?: CSSProperties;
}

type NativeSliderProps = Omit<AriaSliderProps, 'className' | 'style' | 'children'>;

export type SliderProps = SliderOwnProps & NativeSliderProps;

/**
 * `Slider` is a single-thumb numeric range input with optional tick marks
 * and a live value readout. Locale-aware formatting via `formatOptions`.
 * Built on React Aria's `Slider`; fully keyboard accessible.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const {
    label,
    size = 'md',
    marks,
    showValue,
    formatOptions,
    className,
    style,
    minValue = 0,
    maxValue = 100,
    isDisabled,
    ...rest
  } = props;

  return (
    <AriaSlider
      {...rest}
      ref={ref}
      minValue={minValue}
      maxValue={maxValue}
      formatOptions={formatOptions}
      isDisabled={isDisabled}
      className={cn(root, className)}
      style={style}
    >
      {(renderProps) => (
        <>
          {(label || showValue) && (
            <div className={headerRow}>
              {label ? <span>{label}</span> : <span />}
              {showValue && showValue !== 'tooltip' ? (
                <AriaSliderOutput className={valueLabel} />
              ) : null}
            </div>
          )}
          <AriaSliderTrack
            className={cn(track, trackSize[size])}
            data-disabled={isDisabled || undefined}
          >
            <div
              className={fill}
              style={{
                insetInlineStart: 0,
                width: `${(renderProps.state.getThumbPercent(0) * 100).toFixed(3)}%`,
              }}
            />
            <AriaSliderThumb
              index={0}
              className={thumb}
              style={({ isDragging: _, isFocusVisible: __ }) => ({
                top: '50%',
              })}
              aria-label={typeof label === 'string' ? label : undefined}
            />
          </AriaSliderTrack>
          {marks && marks.length > 0 ? (
            <div className={marksRow}>
              {marks.map((mark) => {
                const percent = ((mark.value - minValue) / (maxValue - minValue)) * 100;
                return (
                  <div
                    key={mark.value}
                    className={markWrap}
                    style={{ insetInlineStart: `${percent}%` }}
                  >
                    <span className={markDot} style={{ insetInlineStart: 0 }} />
                    {mark.label ? (
                      <span className={markLabel} style={{ insetInlineStart: 0 }}>
                        {mark.label}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </AriaSlider>
  );
});
