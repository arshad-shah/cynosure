import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Button as AriaButton,
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorThumb as AriaColorThumb,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Input as AriaInput,
  Popover as AriaPopover,
  SliderTrack as AriaSliderTrack,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { popover } from '../shared/popover.css.js';
import {
  area,
  areaThumb,
  contentWrap,
  field,
  slider,
  sliderThumb,
  swatch,
  triggerButton,
} from './ColorPicker.css.js';

export interface ColorPickerOwnProps {
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Custom content inside the popover; defaults to area + hue slider + hex field. */
  children?: ReactNode;
}

type NativeColorPickerProps = Omit<AriaColorPickerProps, 'className' | 'style' | 'children'>;

export type ColorPickerProps = ColorPickerOwnProps & NativeColorPickerProps;

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(props, ref) {
    const { label = 'Pick a color', className, style, children, ...rest } = props;

    return (
      <AriaColorPicker {...rest}>
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
            <AriaDialog className={contentWrap} aria-label="Color picker">
              {children ?? (
                <>
                  <AriaColorArea
                    colorSpace="hsb"
                    xChannel="saturation"
                    yChannel="brightness"
                    className={area}
                  >
                    <AriaColorThumb className={areaThumb} />
                  </AriaColorArea>
                  <AriaColorSlider colorSpace="hsb" channel="hue">
                    <AriaSliderTrack className={slider}>
                      <AriaColorThumb className={sliderThumb} />
                    </AriaSliderTrack>
                  </AriaColorSlider>
                  <AriaColorField>
                    <AriaInput className={field} aria-label="Hex value" />
                  </AriaColorField>
                </>
              )}
            </AriaDialog>
          </AriaPopover>
        </AriaDialogTrigger>
      </AriaColorPicker>
    );
  },
);
