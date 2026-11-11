import { type CSSProperties, type ReactNode, useRef } from "react";
import {
  type FloatingAnchor,
  type PopoverEl,
  useFloatingAnchor,
  useFloatingOffset,
  usePopover,
} from "../../overlay/floating.js";
import type { Placement } from "../../overlay/position.js";
import { useAnchoredPosition } from "../../overlay/use-anchored-position.js";

export interface HoverCardTokens {
  /** Background of the card. */
  background: string;
  /** Corner radius. */
  radius: string;
  /** Inner padding. */
  padding: string;
  /** Gap between the card and its anchor. */
  offset: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    hoverCard: HoverCardTokens;
  }
}

export interface HoverCardProps {
  /** Show it. The owner decides when: a hovered row, a focused thumbnail. */
  open: boolean;
  /** What it previews: a ref to an element, or a virtual anchor. */
  anchor: FloatingAnchor;
  /** Preferred side; it flips when there is no room and slides to stay on screen. Default `end`. */
  placement?: Placement;
  /** The preview (a larger thumbnail, a summary). Nothing in it can be clicked or focused. */
  children?: ReactNode;
  className?: string;
  /** Layout only. Restyle through --cy-hover-card-* tokens. */
  style?: CSSProperties;
}

/**
 * A passive preview beside the thing it previews, such as a large thumbnail of a page on hover. It takes no pointer
 * input or focus and is hidden from assistive technology, because it only repeats what its anchor already names; for
 * text that describes a control use Tooltip, and for anything interactive use Popover.
 */
export function HoverCard({ open, anchor, placement = "end", children, className, style }: HoverCardProps) {
  const card = useRef<PopoverEl>(null);
  const target = useFloatingAnchor(anchor);
  const shown = open && target.present;
  usePopover(card, shown);
  const offset = useFloatingOffset(card);
  useAnchoredPosition(target.ref, card, shown, placement, offset);
  return (
    <div
      ref={card}
      className={className ? `cy-hover-card ${className}` : "cy-hover-card"}
      aria-hidden="true"
      {...{ popover: "manual", inert: true }}
      style={style}
    >
      {children}
    </div>
  );
}
