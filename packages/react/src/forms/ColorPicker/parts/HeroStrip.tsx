import { ColorSwatch as AriaColorSwatch, type Color } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import {
  hero,
  heroChip,
  heroChipBySize,
  heroHex,
  heroHexBySize,
  heroMeta,
  heroReadout,
} from '../ColorPicker.css.js';
import type { ColorFormat } from './FormatField.js';

export type HeroStripSize = 'sm' | 'md' | 'lg';

interface HeroStripProps {
  color: Color;
  format: ColorFormat;
  size: HeroStripSize;
  alpha: boolean;
}

function readoutFor(color: Color, format: ColorFormat, alpha: boolean): string {
  if (format === 'rgb') {
    const rgb = color.toFormat('rgb');
    const r = Math.round(rgb.getChannelValue('red'));
    const g = Math.round(rgb.getChannelValue('green'));
    const b = Math.round(rgb.getChannelValue('blue'));
    if (alpha) {
      const a = Number(rgb.getChannelValue('alpha').toFixed(2));
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (format === 'hsl') {
    const hsl = color.toFormat('hsl');
    const h = Math.round(hsl.getChannelValue('hue'));
    const s = Math.round(hsl.getChannelValue('saturation'));
    const l = Math.round(hsl.getChannelValue('lightness'));
    if (alpha) {
      const a = Number(hsl.getChannelValue('alpha').toFixed(2));
      return `hsla(${h}°, ${s}%, ${l}%, ${a})`;
    }
    return `hsl(${h}°, ${s}%, ${l}%)`;
  }
  const rgb = color.toFormat('rgb');
  const r = Math.round(rgb.getChannelValue('red'));
  const g = Math.round(rgb.getChannelValue('green'));
  const b = Math.round(rgb.getChannelValue('blue'));
  return `rgb ${r} · ${g} · ${b}`;
}

/**
 * Preview chip + format-aware readout shown at the top of the picker panel.
 * Purely presentational — derives both lines from the current `color`.
 */
export function HeroStrip({ color, format, size, alpha }: HeroStripProps): React.ReactElement {
  const hex = color.toString('hex').toUpperCase();
  return (
    <div className={hero} role="presentation">
      <AriaColorSwatch
        color={color}
        className={cn(heroChip, heroChipBySize[size])}
        aria-hidden="true"
      />
      <div className={heroMeta}>
        <span className={cn(heroHex, heroHexBySize[size])} data-testid="color-picker-hero-hex">
          {hex}
        </span>
        <span className={heroReadout} data-testid="color-picker-hero-readout">
          {readoutFor(color, format, alpha)}
        </span>
      </div>
    </div>
  );
}
