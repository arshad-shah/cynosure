import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Color } from 'react-aria-components';
import { ToggleGroup, ToggleGroupItem } from '../../../feedback/ToggleGroup/ToggleGroup.js';
import { IconButton } from '../../IconButton/IconButton.js';
import { formatStack, formatToolbar, formatToolbarActions } from '../ColorPicker.css.js';
import { ChannelCells, type ChannelCellsSize } from './ChannelCells.js';

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

interface FormatFieldProps {
  value: Color;
  onChange: (color: Color) => void;
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  alpha?: boolean;
  size: ChannelCellsSize;
  eyedropper?: React.ReactNode;
}

function colorToString(color: Color, format: ColorFormat): string {
  switch (format) {
    case 'hex':
      return color.toString('hex');
    case 'rgb':
      return color.toString('rgb');
    case 'hsl':
      return color.toString('hsl');
  }
}

/** Toolbar (format toggle + copy/eyedropper) above the channel cell grid. */
export function FormatField({
  value,
  onChange,
  format,
  onFormatChange,
  alpha = false,
  size,
  eyedropper,
}: FormatFieldProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <div className={formatStack}>
      <div className={formatToolbar}>
        <ToggleGroup
          type="single"
          value={format}
          onValueChange={(next) => {
            if (next) onFormatChange(next as ColorFormat);
          }}
          size="sm"
          variant="outline"
          attached
          aria-label="Color format"
        >
          <ToggleGroupItem value="hex">HEX</ToggleGroupItem>
          <ToggleGroupItem value="rgb">RGB</ToggleGroupItem>
          <ToggleGroupItem value="hsl">HSL</ToggleGroupItem>
        </ToggleGroup>
        <div className={formatToolbarActions}>
          <IconButton
            variant="ghost"
            size="sm"
            label={copied ? 'Copied' : 'Copy color'}
            icon={
              copied ? (
                <Check aria-hidden="true" size={14} />
              ) : (
                <Copy aria-hidden="true" size={14} />
              )
            }
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(colorToString(value, format));
                setCopied(true);
              } catch {
                // Clipboard denied — silently ignored.
              }
            }}
          />
          {eyedropper}
        </div>
      </div>

      <ChannelCells value={value} onChange={onChange} format={format} alpha={alpha} size={size} />
    </div>
  );
}
