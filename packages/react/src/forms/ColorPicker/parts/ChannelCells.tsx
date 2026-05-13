import { useEffect, useId, useState } from 'react';
import { type Color, type ColorChannel, type ColorSpace, parseColor } from 'react-aria-components';
import { cn } from '../../../utils/cn.js';
import {
  fieldWell,
  inertWell,
  inputElement,
  multiWellRoot,
  slotGroup,
} from '../../Input/Input.css.js';
import {
  cellFieldWell,
  cellGlyph,
  cellInput,
  cellRoot,
  cellSize,
  cellSlot,
  cellsRow,
  cellsRowCols,
} from '../ColorPicker.css.js';
import type { ColorFormat } from './FormatField.js';

export type ChannelCellsSize = 'sm' | 'md' | 'lg';

interface ChannelCellsProps {
  value: Color;
  onChange: (color: Color) => void;
  format: ColorFormat;
  alpha?: boolean;
  size: ChannelCellsSize;
}

type HexSpec = { kind: 'hex'; glyph: string; label: string };
type ChannelSpec = {
  kind: 'channel';
  glyph: string;
  suffix?: string;
  label: string;
  channel: ColorChannel;
  colorSpace: ColorSpace;
  /** Multiply the underlying channel value by this when displaying; divide on commit. */
  displayScale?: number;
};
type CellSpec = HexSpec | ChannelSpec;

function specsFor(format: ColorFormat, alpha: boolean): CellSpec[] {
  switch (format) {
    case 'hex':
      return [{ kind: 'hex', glyph: '#', label: 'Hex value' }];
    case 'rgb': {
      const out: CellSpec[] = [
        { kind: 'channel', glyph: 'R', label: 'Red', channel: 'red', colorSpace: 'rgb' },
        { kind: 'channel', glyph: 'G', label: 'Green', channel: 'green', colorSpace: 'rgb' },
        { kind: 'channel', glyph: 'B', label: 'Blue', channel: 'blue', colorSpace: 'rgb' },
      ];
      if (alpha) {
        out.push({
          kind: 'channel',
          glyph: 'A',
          suffix: '%',
          label: 'Alpha',
          channel: 'alpha',
          colorSpace: 'rgb',
          displayScale: 100,
        });
      }
      return out;
    }
    case 'hsl': {
      const out: CellSpec[] = [
        {
          kind: 'channel',
          glyph: 'H',
          suffix: '°',
          label: 'Hue',
          channel: 'hue',
          colorSpace: 'hsl',
        },
        {
          kind: 'channel',
          glyph: 'S',
          suffix: '%',
          label: 'Saturation',
          channel: 'saturation',
          colorSpace: 'hsl',
        },
        {
          kind: 'channel',
          glyph: 'L',
          suffix: '%',
          label: 'Lightness',
          channel: 'lightness',
          colorSpace: 'hsl',
        },
      ];
      if (alpha) {
        out.push({
          kind: 'channel',
          glyph: 'A',
          suffix: '%',
          label: 'Alpha',
          channel: 'alpha',
          colorSpace: 'hsl',
          displayScale: 100,
        });
      }
      return out;
    }
  }
}

/** Round to 0 decimals for whole-number channels (255, 360°, %), preserve the rest. */
function formatNumber(n: number): string {
  if (Number.isNaN(n)) return '';
  const rounded = Math.round(n);
  return Math.abs(n - rounded) < 0.5 ? String(rounded) : n.toFixed(1);
}

/**
 * Build the `multiWellRoot` data-attribute set the Input CSS expects so cells
 * inherit Input's hover/focus chrome.
 */
function rootDataAttrs(hover: boolean): React.HTMLAttributes<HTMLDivElement> {
  return {
    'data-variant': 'outline',
    'data-hover': hover ? 'true' : undefined,
  } as unknown as React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Single numeric channel cell — uses Input's well anatomy (root + leading slot
 * + field well + trailing slot). The `<input>` is plain text/inputMode=decimal;
 * we read `color.getChannelValue` and write `color.withChannelValue` so the
 * displayed value is a bare number (no localized unit suffix baked in).
 */
function ChannelCell({
  spec,
  value,
  onChange,
  sizeClass,
}: {
  spec: ChannelSpec;
  value: Color;
  onChange: (next: Color) => void;
  sizeClass: string;
}): React.ReactElement {
  const scale = spec.displayScale ?? 1;
  // Convert color into the spec's color space when needed so the channel is valid.
  const converted = value.toFormat(spec.colorSpace);
  const channelValue = converted.getChannelValue(spec.channel) * scale;
  const range = converted.getChannelRange(spec.channel);

  const [hover, setHover] = useState(false);
  const [draft, setDraft] = useState(() => formatNumber(channelValue));
  const [focused, setFocused] = useState(false);
  const id = useId();

  // Reflect external value changes into the draft when not actively typing.
  useEffect(() => {
    if (!focused) setDraft(formatNumber(channelValue));
  }, [channelValue, focused]);

  const commit = (raw: string): void => {
    const parsed = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) {
      setDraft(formatNumber(channelValue));
      return;
    }
    const clamped = Math.min(range.maxValue, Math.max(range.minValue, parsed / scale));
    onChange(converted.withChannelValue(spec.channel, clamped));
  };

  return (
    <div
      className={cn(multiWellRoot, cellRoot, cellSize[sizeClass as ChannelCellsSize])}
      {...rootDataAttrs(hover)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className={slotGroup}>
        <span className={cn(inertWell, cellSlot, cellGlyph)} data-slot-kind="inert">
          {spec.glyph}
        </span>
      </span>
      <span className={cn(fieldWell, cellFieldWell)}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-label={spec.label}
          className={cn(inputElement, cellInput)}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit(draft);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const step = e.shiftKey ? range.pageSize * scale : range.step * scale;
              const dir = e.key === 'ArrowUp' ? 1 : -1;
              const nextDisplay = Math.min(
                range.maxValue * scale,
                Math.max(range.minValue * scale, channelValue + dir * step),
              );
              setDraft(formatNumber(nextDisplay));
              const clamped = nextDisplay / scale;
              onChange(converted.withChannelValue(spec.channel, clamped));
            }
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </span>
      {spec.suffix ? (
        <span className={slotGroup}>
          <span className={cn(inertWell, cellSlot, cellGlyph)} data-slot-kind="inert">
            {spec.suffix}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/** Pull just the 6 (or 8 with alpha) hex digits — no leading `#`. */
function hexDigitsOf(color: Color): string {
  const full = color.toString('hex'); // "#RRGGBB"
  return full.startsWith('#') ? full.slice(1) : full;
}

/** Hex cell — plain input that holds only the digits; the `#` lives in the slot. */
function HexCell({
  spec,
  value,
  onChange,
  sizeClass,
}: {
  spec: HexSpec;
  value: Color;
  onChange: (next: Color) => void;
  sizeClass: ChannelCellsSize;
}): React.ReactElement {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => hexDigitsOf(value));
  const id = useId();

  useEffect(() => {
    if (!focused) setDraft(hexDigitsOf(value));
  }, [value, focused]);

  const commit = (raw: string): void => {
    const cleaned = raw.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3}([0-9a-fA-F]{2})?)?$/.test(cleaned)) {
      setDraft(hexDigitsOf(value));
      return;
    }
    try {
      onChange(parseColor(`#${cleaned}`));
    } catch {
      setDraft(hexDigitsOf(value));
    }
  };

  return (
    <div
      className={cn(multiWellRoot, cellRoot, cellSize[sizeClass as ChannelCellsSize])}
      {...rootDataAttrs(hover)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className={slotGroup}>
        <span className={cn(inertWell, cellSlot, cellGlyph)} data-slot-kind="inert">
          {spec.glyph}
        </span>
      </span>
      <span className={cn(fieldWell, cellFieldWell)}>
        <input
          id={id}
          type="text"
          inputMode="text"
          aria-label={spec.label}
          className={cn(inputElement, cellInput)}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            e.currentTarget.select();
          }}
          onBlur={() => {
            setFocused(false);
            commit(draft);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
        />
      </span>
    </div>
  );
}

/**
 * Slot-based color value editor. Each cell uses Input's well anatomy
 * (`multiWellRoot` + `inertWell` slot + `fieldWell` + `inputElement`), so the
 * cells visually match other Cynosure form controls. Non-hex channels render
 * plain numeric values; the `°` / `%` suffix lives in a trailing inert slot.
 */
export function ChannelCells({
  value,
  onChange,
  format,
  alpha = false,
  size,
}: ChannelCellsProps): React.ReactElement {
  const specs = specsFor(format, alpha);
  const cols = (specs.length === 1 ? 1 : specs.length === 4 ? 4 : 3) as 1 | 3 | 4;

  return (
    <div className={cn(cellsRow, cellsRowCols[cols])}>
      {specs.map((spec) =>
        spec.kind === 'hex' ? (
          <HexCell key="hex" spec={spec} value={value} onChange={onChange} sizeClass={size} />
        ) : (
          <ChannelCell
            key={spec.channel + spec.colorSpace}
            spec={spec}
            value={value}
            onChange={onChange}
            sizeClass={size}
          />
        ),
      )}
    </div>
  );
}
