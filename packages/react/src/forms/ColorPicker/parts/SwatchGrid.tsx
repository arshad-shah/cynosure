import { Plus } from 'lucide-react';
import { ColorSwatch as AriaColorSwatch, type Color, parseColor } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import {
  swatchAddTile,
  swatchGrid,
  swatchLabel,
  swatchSection,
  swatchTile,
  swatchTileActive,
  swatchTileBySize,
} from '../ColorPicker.css.js';

interface SwatchGridProps {
  value: Color;
  swatches: string[];
  onSelect: (color: Color) => void;
  onSwatchesChange?: (next: string[]) => void;
  maxSwatches?: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Labelled grid of saved colours with optional inline "+" save tile. */
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
    <section className={swatchSection}>
      <span className={swatchLabel}>
        Saved colors · {swatches.length} of {maxSwatches}
      </span>
      <fieldset className={swatchGrid} aria-label="Saved colors">
        {swatches.map((hex) => {
          const isActive = hex.toLowerCase() === currentHex;
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Use color ${hex}`}
              data-active={isActive ? 'true' : undefined}
              className={cn(swatchTile, swatchTileBySize[size], isActive && swatchTileActive)}
              onClick={() => onSelect(parseColor(hex))}
            >
              <AriaColorSwatch
                color={hex}
                style={{ width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }}
              />
            </button>
          );
        })}
        {canEdit && !alreadySaved ? (
          <button
            type="button"
            aria-label="Save current color to swatches"
            className={cn(swatchAddTile, swatchTileBySize[size])}
            onClick={() => {
              const next = [
                currentHex,
                ...swatches.filter((s) => s.toLowerCase() !== currentHex),
              ].slice(0, maxSwatches);
              onSwatchesChange?.(next);
            }}
          >
            <Plus aria-hidden="true" size={14} />
          </button>
        ) : null}
      </fieldset>
    </section>
  );
}
