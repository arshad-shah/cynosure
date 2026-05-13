import { type CSSProperties, type ReactNode, forwardRef, useState } from 'react';
import {
  Button as AriaButton,
  ColorArea as AriaColorArea,
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorThumb as AriaColorThumb,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  SliderTrack as AriaSliderTrack,
  type Color,
  parseColor,
} from 'react-aria-components';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import { popover } from '../shared/popover.css.js';
import {
  ALPHA_CHECKER,
  area,
  areaBySize,
  areaThumb,
  areaThumbBySize,
  contentWrap,
  contentWrapBySize,
  field,
  inlinePanel,
  slider,
  sliderBySize,
  sliderThumb,
  sliderThumbBySize,
  swatch,
  triggerButton,
} from './ColorPicker.css.js';
import { EyedropperButton } from './parts/EyedropperButton.js';
import { type ColorFormat, FormatField } from './parts/FormatField.js';
import { SwatchGrid } from './parts/SwatchGrid.js';

export type ColorPickerSize = 'sm' | 'md' | 'lg';

export interface ColorPickerOwnProps {
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Size preset — affects panel width, area height, slider thickness, cell density. Default `md`. */
  size?: ColorPickerSize;
  /** `popover` (default) renders a swatch trigger; `inline` drops the trigger and renders the body in place. */
  variant?: 'popover' | 'inline';
  /** Show an alpha slider + checker pattern under the hue slider. */
  alpha?: boolean;
  /** Show the browser eyedropper button when supported. Default `true`. */
  eyedropper?: boolean;
  /** Default format selected in the segmented control. */
  defaultFormat?: ColorFormat;
  /** Controlled list of saved swatches (hex strings). */
  swatches?: string[];
  /** When provided, the picker shows a "save current" affordance that prepends the current color. */
  onSwatchesChange?: (next: string[]) => void;
  /** Cap on swatches kept in the list when a save happens. */
  maxSwatches?: number;
  /** Escape hatch — replaces the entire popover/inline body. */
  children?: ReactNode;
}

type NativeColorPickerProps = Omit<
  AriaColorPickerProps,
  'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: Color | string;
  defaultValue?: Color | string;
  onChange?: (color: Color) => void;
};

export type ColorPickerProps = ColorPickerOwnProps & NativeColorPickerProps;

function coerce(input: Color | string | undefined, fallback: string): Color | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'string') {
    try {
      return parseColor(input);
    } catch {
      return parseColor(fallback);
    }
  }
  return input;
}

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(props, ref) {
    const {
      label = 'Pick a color',
      className,
      style,
      children,
      size = 'md',
      variant = 'popover',
      alpha = false,
      eyedropper = true,
      defaultFormat = 'hex',
      swatches,
      onSwatchesChange,
      maxSwatches,
      value: valueProp,
      defaultValue: defaultValueProp,
      onChange,
      ...rest
    } = props;

    const [color, setColor] = useControllableState<Color>({
      value: coerce(valueProp, '#000000'),
      defaultValue: coerce(defaultValueProp, '#000000') ?? parseColor('#000000'),
      onChange,
    });
    const [format, setFormat] = useState<ColorFormat>(defaultFormat);

    const body = children ?? (
      <>
        <AriaColorArea
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
          className={cn(area, areaBySize[size])}
        >
          <AriaColorThumb className={cn(areaThumb, areaThumbBySize[size])} />
        </AriaColorArea>
        <AriaColorSlider colorSpace="hsb" channel="hue">
          <AriaSliderTrack className={cn(slider, sliderBySize[size])}>
            <AriaColorThumb className={cn(sliderThumb, sliderThumbBySize[size])} />
          </AriaSliderTrack>
        </AriaColorSlider>
        {alpha ? (
          <AriaColorSlider channel="alpha">
            <AriaSliderTrack
              className={cn(slider, sliderBySize[size])}
              style={({ defaultStyle }) => ({
                background: `${defaultStyle.background}, ${ALPHA_CHECKER}`,
              })}
            >
              <AriaColorThumb className={cn(sliderThumb, sliderThumbBySize[size])} />
            </AriaSliderTrack>
          </AriaColorSlider>
        ) : null}
        <FormatField
          value={color}
          onChange={setColor}
          format={format}
          onFormatChange={setFormat}
          alpha={alpha}
          size={size}
          eyedropper={eyedropper ? <EyedropperButton onPick={(c) => setColor(c)} /> : null}
        />
        {swatches ? (
          <SwatchGrid
            value={color}
            swatches={swatches}
            onSelect={setColor}
            onSwatchesChange={onSwatchesChange}
            maxSwatches={maxSwatches}
            size={size}
          />
        ) : null}
      </>
    );

    const bodyClass = cn(contentWrap, contentWrapBySize[size]);

    if (variant === 'inline') {
      return (
        <AriaColorPicker {...rest} value={color} onChange={setColor}>
          <div className={cn(inlinePanel, bodyClass, className)} style={style}>
            {body}
          </div>
        </AriaColorPicker>
      );
    }

    return (
      <AriaColorPicker {...rest} value={color} onChange={setColor}>
        <AriaDialogTrigger>
          <AriaButton
            ref={ref}
            className={cn(triggerButton, className)}
            style={style}
            aria-label={typeof label === 'string' ? label : 'Pick a color'}
          >
            <AriaColorSwatch className={swatch} />
            {label ? <span>{label}</span> : null}
          </AriaButton>
          <AriaPopover className={popover} placement="bottom start">
            <AriaDialog className={bodyClass} aria-label="Color picker">
              {body}
            </AriaDialog>
          </AriaPopover>
        </AriaDialogTrigger>
      </AriaColorPicker>
    );
  },
);

// Legacy re-export for consumers that pass custom `children` and want the
// pre-update single-field styles.
export { field as colorFieldClassName };
export type { ColorFormat };
