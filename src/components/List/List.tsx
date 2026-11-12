import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { check } from "../../icons/check.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { IconTile } from "../IconTile/IconTile.js";

export interface ListTokens {
  /** Space between items at `gap="sm"`. */
  gapSm: string;
  /** Space between items at `gap="md"`. */
  gapMd: string;
  /** Space between items at `gap="lg"`. */
  gapLg: string;
  /** Space between the marker and the item's text. */
  markerGap: string;
  /** Colour of a disc marker when the list and the item have no `tone`. */
  markerColor: string;
  /** Diameter of the circle behind a number. */
  numberSize: string;
  /** Colour of the description. */
  descriptionColor: string;
  /** Colour of the line between items with `divided`. */
  dividerColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    list: ListTokens;
  }
}

export interface ListItem {
  /** Stable and unique: the React key. Default: the item's position. */
  id?: string | undefined;
  /** The item's text, or its title when it has a description. */
  label: ReactNode;
  /** A second, quieter line under the label. */
  description?: ReactNode;
  /** This item's icon for `marker="icon"` or `"tile"`. Overrides the list's `icon`. */
  icon?: IconData | undefined;
  /** This item's marker colour. Overrides the list's `tone`. */
  tone?: Tone | undefined;
}

export type ListMarker = "disc" | "number" | "check" | "icon" | "tile" | "none";

export interface ListProps {
  /** The items, in order. */
  items: ListItem[];
  /**
   * What sits before each item: `disc` a dot, `number` its position in a tinted circle, `check` a tick (a feature
   * list), `icon` the item's icon, `tile` the item's icon on an IconTile, `none` nothing. Default "disc".
   */
  marker?: ListMarker;
  /** `ol` when the order matters (steps of a how-to), `ul` when it does not. Default "ol" with numbers, else "ul". */
  as?: "ul" | "ol";
  /** The number of the first item, with `marker="number"`. Default 1. */
  start?: number;
  /** Icon of every item for `marker="icon"` or `"tile"`; an item's own `icon` wins. Without either, a disc. */
  icon?: IconData | undefined;
  /** Colour of the markers. Default: muted ink for discs, "success" for ticks, "accent" otherwise. */
  tone?: Tone | undefined;
  /** Space between items. Default "md". */
  gap?: "none" | "sm" | "md" | "lg";
  /** A line between items. Default false. */
  divided?: boolean;
  /** Text size, and with it the markers. Default "md". */
  size?: Size;
  /** Names the list for assistive technology ("Install steps"), when no heading above it does. */
  label?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-list-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_TONES: Partial<Record<ListMarker, Tone>> = {
  number: "accent",
  check: "success",
  icon: "accent",
  tile: "accent",
};
const TILE_SIZE = { sm: "sm", md: "sm", lg: "md" } as const;

/**
 * A real list (`ul` or `ol`) with styled markers: bullets, numbered how-to steps, a ticked feature list, or items with
 * icons. Each item has a label and an optional description.
 */
export const List = forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(function List(
  {
    items,
    marker = "disc",
    as,
    start = 1,
    icon,
    tone,
    gap = "md",
    divided = false,
    size = "md",
    label,
    className,
    style,
  },
  ref,
) {
  const Tag = as ?? (marker === "number" ? "ol" : "ul");
  const markerOf = (item: ListItem, i: number) => {
    const glyph = item.icon ?? icon;
    if (marker === "number") return <span className="cy-list-number cy-reset">{start + i}</span>;
    if (marker === "check") return <Icon icon={check} />;
    if (marker === "icon" && glyph) return <Icon icon={glyph} />;
    if (marker === "tile" && glyph)
      return <IconTile icon={glyph} size={TILE_SIZE[size]} tone={item.tone ?? tone ?? "accent"} />;
    return <span className="cy-list-dot cy-reset" />;
  };
  return (
    <Tag
      ref={ref as never}
      // Explicit: Safari drops the list role from a list drawn without bullets.
      role="list"
      aria-label={label}
      start={Tag === "ol" && start !== 1 ? start : undefined}
      className={className ? `cy-list ${className}` : "cy-list"}
      data-marker={marker}
      data-gap={gap}
      data-size={size}
      data-divided={divided ? "" : undefined}
      style={style}
    >
      {items.map((item, i) => (
        <li
          key={item.id ?? i}
          className="cy-list-item"
          data-tone={item.tone ?? tone ?? DEFAULT_TONES[marker]}
          data-description={item.description != null ? "" : undefined}
        >
          {marker !== "none" && (
            <span className="cy-list-marker cy-reset" aria-hidden="true">
              {markerOf(item, i)}
            </span>
          )}
          <div className="cy-list-text cy-reset">
            <div className="cy-list-label cy-reset">{item.label}</div>
            {item.description != null && <div className="cy-list-description">{item.description}</div>}
          </div>
        </li>
      ))}
    </Tag>
  );
});
