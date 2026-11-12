import { type CSSProperties, forwardRef, type MouseEventHandler, type ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { arrowDown } from "../../icons/arrow-down.js";
import { arrowUp } from "../../icons/arrow-up.js";
import { minus } from "../../icons/minus.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Card } from "../Card/Card.js";
import { IconTile } from "../IconTile/IconTile.js";

export interface StatTokens {
  /** Space between the icon tile and the text. */
  gap: string;
  /** Colour of the label and the description. */
  labelColor: string;
  /** Font family of the value. Falls back to the display font. */
  valueFont: string;
  /** Font weight of the value. */
  valueWeight: string;
  /** Font size of the value at `size="sm"`. */
  valueSizeSm: string;
  /** Font size of the value at `size="md"`. */
  valueSizeMd: string;
  /** Font size of the value at `size="lg"`. */
  valueSizeLg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    stat: StatTokens;
  }
}

export type StatDirection = "up" | "down" | "flat";

export interface StatDelta {
  /** The change as shown, e.g. "12%" or "+£1,200". */
  value: string;
  /**
   * Which way it moved: picks the arrow and the spoken word. Default: "up" when `value` starts with "+", "down" when
   * it starts with "-" or "−", otherwise "flat".
   */
  direction?: StatDirection | undefined;
  /**
   * Colour of the change. Default: "success" for up, "danger" for down, "neutral" for flat. Set it when down is good
   * news (costs, errors, load time).
   */
  tone?: Tone | undefined;
}

export interface StatLabels {
  /** Spoken for a rise, from the delta's value without its sign. Default "up 12%". */
  up: (value: string) => string;
  /** Spoken for a fall. Default "down 12%". */
  down: (value: string) => string;
  /** Spoken when nothing moved. Default "unchanged at 0%". */
  flat: (value: string) => string;
}

export interface StatProps {
  /** What is measured ("Revenue"). Read before the value. */
  label: ReactNode;
  /** The figure ("£12,400"). Digits are tabular, so stats in a row line up. */
  value: ReactNode;
  /** A unit written after the value, smaller ("ms", "users"). */
  unit?: ReactNode;
  /** A line under the value: what the figure covers ("Last 30 days") or how it compares ("vs last month"). */
  description?: ReactNode;
  /** The change since last time: an arrow, the value in a tone, and a spoken direction ("up 12%"). */
  delta?: StatDelta | undefined;
  /** An icon on an IconTile at the start of the stat. Decorative: the label names the stat. */
  icon?: IconData | undefined;
  /** Colour of the icon tile. Default "accent". */
  iconTone?: Tone;
  /** Size of the value, the text, the icon tile and the padding. Default "md". */
  size?: Size;
  /** `start`: icon beside the text, text at the start. `center`: icon above, everything centred. Default "start". */
  align?: "start" | "center";
  /** The card's look, as Card's: `surface` raised, `outline` border only, `soft` tinted. Default "surface". */
  variant?: "surface" | "outline" | "soft";
  /** Element of a static stat: `li` inside a list of stats, `article` for a stat that stands alone. Default "div". */
  as?: "div" | "li" | "article";
  /** Makes the whole stat a link to the figure's detail (through Card, so unsafe schemes are not linked). */
  href?: string | undefined;
  /** With `href`: where it opens, e.g. `_blank`. */
  target?: string | undefined;
  /** With `href`: called when the link is followed, before the browser navigates. */
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  /** Replace the built-in English words spoken with the delta. */
  labels?: Partial<StatLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-stat-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: StatLabels = {
  up: (value) => `up ${value}`,
  down: (value) => `down ${value}`,
  flat: (value) => `unchanged at ${value}`,
};
const ARROWS = { up: arrowUp, down: arrowDown, flat: minus };
const DELTA_TONES = { up: "success", down: "danger", flat: "neutral" } as const;
/** A leading plus or minus: the spoken word already says which way. */
const SIGN = /^[+\-\u2212]\s*/;
const PADDING = { sm: "sm", md: "md", lg: "lg" } as const;

/** The direction a delta's value implies when none is given. */
function directionOf(value: string): StatDirection {
  const sign = value.trim()[0];
  return sign === "+" ? "up" : sign === "-" || sign === "−" ? "down" : "flat";
}

/**
 * A figure with its label (a KPI tile): the value, an optional unit, change and description, on a Card. The label and
 * the figures are a description list, so they are read as "Revenue, £12,400, up 12%".
 */
export const Stat = forwardRef<HTMLElement, StatProps>(function Stat(
  {
    label,
    value,
    unit,
    description,
    delta,
    icon,
    iconTone = "accent",
    size = "md",
    align = "start",
    variant = "surface",
    as = "div",
    href,
    target,
    onClick,
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const direction = delta ? (delta.direction ?? directionOf(delta.value)) : "flat";
  const As = as;
  const card = (
    <Card
      ref={ref}
      as={as}
      variant={variant}
      padding={PADDING[size]}
      {...(href !== undefined && {
        href,
        ...(target !== undefined && { target }),
        ...(onClick !== undefined && { onClick }),
      })}
      className={className ? `cy-stat ${className}` : "cy-stat"}
      {...(style !== undefined && { style })}
    >
      <div className="cy-stat-body cy-reset" data-size={size} data-align={align}>
        {icon && <IconTile icon={icon} tone={iconTone} size={size} />}
        <dl className="cy-stat-list cy-reset">
          <dt className="cy-stat-label">{label}</dt>
          <dd className="cy-stat-value">
            {value}
            {unit != null && <span className="cy-stat-unit">{unit}</span>}
          </dd>
          {delta && (
            <dd className="cy-stat-delta" data-tone={delta.tone ?? DELTA_TONES[direction]}>
              <Icon icon={ARROWS[direction]} size="sm" />
              <span className="cy-reset" aria-hidden="true">
                {delta.value}
              </span>
              <span className="cy-visually-hidden">
                {text[direction](delta.value.trim().replace(SIGN, ""))}
              </span>
            </dd>
          )}
          {description != null && <dd className="cy-stat-description">{description}</dd>}
        </dl>
      </div>
    </Card>
  );
  // A linked stat in a list keeps its list item: the link goes inside it.
  return href !== undefined && as !== "div" ? <As className="cy-stat-item cy-reset">{card}</As> : card;
});
