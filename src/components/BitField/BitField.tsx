import type { CSSProperties } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { Toolbar } from "../Toolbar/Toolbar.js";

export interface BitFieldTokens {
  /** Space between the groups of bits. */
  gap: string;
  /** Space between the bits of a group. */
  bitGap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    bitField: BitFieldTokens;
  }
}

export interface BitFieldLabels {
  /** A bit's toggle, by its index (0 is the lowest). Default: "Bit 7". */
  bit: (index: number) => string;
  /** A group of bits, by its highest and lowest index. Default: "Bits 15 to 8". */
  group: (high: number, low: number) => string;
}

export interface BitFieldProps {
  /** Names the toolbar of bits ("Bits of 0x8005"). */
  label: string;
  /** How many bits are shown, highest first. Default 8. Up to 64 or more: the value is a bigint. */
  bits?: number;
  /** Bits per group, the lowest group ending at bit 0. Default 8 (a byte); 4 groups by hex digit. */
  groupSize?: number;
  /** Controlled: the number the bits show (only its low `bits` bits). */
  value?: bigint | undefined;
  /** The number at first, when uncontrolled. Default 0n. */
  defaultValue?: bigint | undefined;
  /** Called with the new number when a bit is flipped. */
  onChange?: ((value: bigint) => void) | undefined;
  /** Turns every bit off for input. */
  disabled?: boolean | undefined;
  /** Size of the toggles. Default "md". */
  size?: Size;
  /** Fill of a set bit. Default "accent". */
  tone?: Tone;
  /** Replace the built-in English names of the bits and their groups. */
  labels?: Partial<BitFieldLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-bit-field-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: BitFieldLabels = {
  bit: (n) => `Bit ${n}`,
  group: (high, low) => `Bits ${high} to ${low}`,
};

/**
 * The bits of a number as a row of toggle buttons, highest first and grouped by byte: one tab stop, arrows between
 * the bits (an APG toolbar of pressed Buttons), Space or a press flips one.
 */
export function BitField({
  label,
  bits = 8,
  groupSize = 8,
  value,
  defaultValue = 0n,
  onChange,
  disabled,
  size = "md",
  tone = "accent",
  labels,
  className,
  style,
}: BitFieldProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
  const width = Math.max(1, Math.floor(bits));
  const per = Math.max(1, Math.floor(groupSize));
  // Groups from the top: the lowest group ends at bit 0, so the highest one may be short.
  const groups: number[][] = [];
  for (let high = width - 1; high >= 0; ) {
    const low = Math.floor(high / per) * per;
    const group: number[] = [];
    for (let n = high; n >= low; n--) group.push(n);
    groups.push(group);
    high = low - 1;
  }
  return (
    <div className={className ? `cy-bit-field ${className}` : "cy-bit-field"} data-size={size} style={style}>
      <Toolbar label={label} className="cy-bit-field-bits">
        {groups.map((group) => (
          // biome-ignore lint/a11y/useSemanticElements: a byte of toggles inside a toolbar, not a form's fieldset
          <span
            key={group[0]}
            role="group"
            aria-label={text.group(group[0] as number, group[group.length - 1] as number)}
            className="cy-bit-field-group"
          >
            {group.map((n) => {
              const mask = 1n << BigInt(n);
              const on = (current & mask) !== 0n;
              return (
                <Button
                  key={n}
                  square
                  size={size}
                  tone={on ? tone : "neutral"}
                  variant={on ? "solid" : "outline"}
                  pressed={on}
                  disabled={disabled}
                  aria-label={text.bit(n)}
                  onClick={() => setCurrent(current ^ mask)}
                >
                  {on ? "1" : "0"}
                </Button>
              );
            })}
          </span>
        ))}
      </Toolbar>
    </div>
  );
}
