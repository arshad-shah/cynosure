import type { RefObject } from "react";
import { useClientLayoutEffect } from "../foundations/client-layout-effect.js";
import { isRtl } from "../foundations/dir.js";
import { computePosition, type Placement } from "./position.js";

/** Anything with a viewport rectangle: an element, or a point such as a right-click position. */
export interface VirtualAnchor {
  getBoundingClientRect(): DOMRect;
}

/** Keeps a fixed-position floating element anchored to `anchor` while `open` (follows scrolls, resizes and anchor moves). */
export function useAnchoredPosition(
  anchor: RefObject<HTMLElement | VirtualAnchor | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  placement: Placement,
  offset = 6,
  align: "center" | "start" | "flush" = "center",
  onPlace?: (placement: Placement) => void,
) {
  useClientLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    let watch = 0;
    let last = "";
    // What the placement depends on besides the viewport: where the anchor is, and how big the floating element is.
    const measure = (r: DOMRect, f: HTMLElement) =>
      `${r.x},${r.y},${r.width},${r.height},${f.offsetWidth},${f.offsetHeight}`;
    const update = () => {
      const a = anchor.current;
      const f = floating.current;
      if (!a || !f) return;
      const r = a.getBoundingClientRect();
      last = measure(r, f);
      // A virtual anchor has no direction of its own: use the floating element's.
      const dir = isRtl(a instanceof Element ? a : f) ? "rtl" : "ltr";
      const pos = computePosition(
        r,
        { width: f.offsetWidth, height: f.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
        placement,
        offset,
        dir,
        align,
      );
      f.style.left = `${pos.x}px`;
      f.style.top = `${pos.y}px`;
      f.dataset.placement = pos.placement;
      onPlace?.(pos.placement);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // Anchors also move without a scroll or resize (a list row reordered, content above growing), and the floating
    // element grows or shrinks with its content (a list filling in): follow both, flipping when it no longer fits.
    const follow = () => {
      const r = anchor.current?.getBoundingClientRect();
      const f = floating.current;
      if (r && f && measure(r, f) !== last) update();
      watch = requestAnimationFrame(follow);
    };
    update();
    watch = requestAnimationFrame(follow);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(watch);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [anchor, floating, open, placement, offset, align, onPlace]);
}
