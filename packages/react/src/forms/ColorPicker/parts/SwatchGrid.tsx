import { Plus } from 'lucide-react';
import { ColorSwatch as AriaColorSwatch, type Color, parseColor } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import { IconButton } from '../../IconButton/IconButton.js';
import { swatchGrid, swatchTile, swatchTileBySize } from '../ColorPicker.css.js';

interface SwatchGridProps {
  value: Color;
  swatches: string[];
  onSelect: (color: Color) => void;
  onSwatchesChange?: (next: string[]) => void;
  maxSwatches?: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Grid of saved colors with an optional "+" affordance to save the current value. */
export function SwatchGrid({
  value,
  swatches,
  onSelect,
  onSwatchesChange,
  maxSwatches = 12,
  size = 'md',
}: SwatchGridProps): React.ReactElement {
  const canEdit = typeof onSwatchesChange === 'function';
  const currentHex = value.toString('hex').toLowerCase();
  const alreadySaved = swatches.some((s) => s.toLowerCase() === currentHex);

  return (
    <fieldset className={swatchGrid} aria-label="Saved colors">
      {swatches.map((hex) => (
        <button
          key={hex}
          type="button"
          aria-label={`Use color ${hex}`}
          className={cn(swatchTile, swatchTileBySize[size])}
          onClick={() => onSelect(parseColor(hex))}
        >
          <AriaColorSwatch
            color={hex}
            style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
          />
        </button>
      ))}
      {canEdit && !alreadySaved ? (
        <IconButton
          variant="ghost"
          size={size === 'lg' ? 'md' : 'sm'}
          label="Save current color to swatches"
          icon={<Plus aria-hidden="true" size={14} />}
          onClick={() => {
            const next = [
              currentHex,
              ...swatches.filter((s) => s.toLowerCase() !== currentHex),
            ].slice(0, maxSwatches);
            onSwatchesChange?.(next);
          }}
        />
      ) : null}
    </fieldset>
  );
}
