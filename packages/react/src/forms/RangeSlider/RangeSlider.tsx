import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Slider as AriaSlider,
  SliderOutput as AriaSliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import {
  fill,
  headerRow,
  root,
  thumb,
  track,
  trackSize,
  valueLabel,
} from '../Slider/Slider.css.js';
import type { FormControlSize } from '../shared/types.js';

/** Cynosure-specific props for `<RangeSlider>`. Inherits min/max/step from React Aria. */
export interface RangeSliderOwnProps {
  /** Visible label rendered above the track. */
  label?: ReactNode;
  /**
   * Track size.
   * @default "md"
   */
  size?: FormControlSize;
  /** Renders the current `[start, end]` pair beside the label. */
  showValue?: boolean;
  /** Intl format options for locale-aware display. */
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  style?: CSSProperties;
}

type NativeSliderProps = Omit<
  AriaSliderProps<number[]>,
  'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
};

export type RangeSliderProps = RangeSliderOwnProps & NativeSliderProps;

/**
 * `RangeSlider` is a two-thumb slider selecting an inclusive `[start, end]`
 * pair. Shares styling and keyboard semantics with `<Slider>`. Built on React
 * Aria's `Slider`; fully keyboard accessible.
 */
export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(props, ref) {
    const {
      label,
      size = 'md',
      showValue,
      formatOptions,
      className,
      style,
      minValue = 0,
      maxValue = 100,
      isDisabled,
      value,
      defaultValue,
      onChange,
      ...rest
    } = props;

    return (
      <AriaSlider
        {...(rest as AriaSliderProps<number[]>)}
        ref={ref}
        minValue={minValue}
        maxValue={maxValue}
        formatOptions={formatOptions}
        isDisabled={isDisabled}
        value={value as number[] | undefined}
        defaultValue={(defaultValue as number[] | undefined) ?? [minValue, maxValue]}
        onChange={(next) => {
          const arr = Array.isArray(next) ? next : [next as number];
          const [start = minValue, end = maxValue] = arr;
          onChange?.([start, end]);
        }}
        className={cn(root, className)}
        style={style}
      >
        {(renderProps) => {
          const startPct = renderProps.state.getThumbPercent(0) * 100;
          const endPct = renderProps.state.getThumbPercent(1) * 100;
          return (
            <>
              {(label || showValue) && (
                <div className={headerRow}>
                  {label ? <span>{label}</span> : <span />}
                  {showValue ? <AriaSliderOutput className={valueLabel} /> : null}
                </div>
              )}
              <AriaSliderTrack
                className={cn(track, trackSize[size])}
                data-disabled={isDisabled || undefined}
              >
                <div
                  className={fill}
                  style={{
                    insetInlineStart: `${startPct.toFixed(3)}%`,
                    width: `${(endPct - startPct).toFixed(3)}%`,
                  }}
                />
                <AriaSliderThumb
                  index={0}
                  className={thumb}
                  style={{ top: '50%' }}
                  aria-label={typeof label === 'string' ? `${label} (min)` : undefined}
                />
                <AriaSliderThumb
                  index={1}
                  className={thumb}
                  style={{ top: '50%' }}
                  aria-label={typeof label === 'string' ? `${label} (max)` : undefined}
                />
              </AriaSliderTrack>
            </>
          );
        }}
      </AriaSlider>
    );
  },
);
