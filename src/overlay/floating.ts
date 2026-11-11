import { type RefObject, useRef, useState } from "react";
import { useClientLayoutEffect } from "../foundations/client-layout-effect.js";
import type { VirtualAnchor } from "./use-anchored-position.js";

/** An element shown with the Popover API (top layer, rendered in place: nothing is added to `<body>`). */
export type PopoverEl = HTMLDivElement & { showPopover?: () => void; hidePopover?: () => void };

/** What a floating surface sits beside: a ref to an element, or a virtual anchor (a selection, a point). */
export type FloatingAnchor = RefObject<HTMLElement | VirtualAnchor | null> | VirtualAnchor | null;

const isRef = (a: FloatingAnchor): a is RefObject<HTMLElement | VirtualAnchor | null> =>
  a !== null && "current" in a;

/**
 * Shows or hides a manual popover with the Popover API, before paint. `onShow` runs right after it is shown, still
 * before paint and before `useAnchoredPosition` measures it (size it, move focus in). Environments without the API
 * (jsdom) skip it.
 */
export function usePopover(
  el: RefObject<HTMLElement | null>,
  open: boolean,
  onShow?: (el: HTMLElement) => void,
) {
  useClientLayoutEffect(() => {
    const node = el.current as PopoverEl | null;
    if (!node?.showPopover) return;
    const shown = node.matches(":popover-open");
    if (open && !shown) {
      node.showPopover();
      onShow?.(node);
    }
    if (!open && shown) node.hidePopover?.();
  });
}

/**
 * The anchor as a ref for `useAnchoredPosition`, and whether there is one. A ref is only attached after render, so it
 * is resolved in a layout effect (before paint).
 */
export function useFloatingAnchor(anchor: FloatingAnchor) {
  const ref = useRef<HTMLElement | VirtualAnchor | null>(null);
  const [present, setPresent] = useState(false);
  useClientLayoutEffect(() => {
    ref.current = isRef(anchor) ? anchor.current : anchor;
    setPresent(ref.current !== null);
  });
  return { ref, present };
}

/** The gap to keep from the anchor, read from the surface's `--_offset` (a token that always resolves). */
export function useFloatingOffset(el: RefObject<HTMLElement | null>) {
  const offset = useRef(8);
  useClientLayoutEffect(() => {
    offset.current = Number.parseFloat(
      getComputedStyle(el.current as HTMLElement).getPropertyValue("--_offset"),
    );
  });
  return offset.current;
}
