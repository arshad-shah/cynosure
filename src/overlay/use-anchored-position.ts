import { type RefObject, useLayoutEffect } from "react";
import { computePosition, type Placement } from "./position.js";

/** Anything with a viewport rectangle: an element, or a point such as a right-click position. */
export interface VirtualAnchor {
  getBoundingClientRect(): DOMRect;
}

/** Keeps a fixed-position floating element anchored to `anchor` while `open` (scroll and resize aware). */
export function useAnchoredPosition(
  anchor: RefObject<HTMLElement | VirtualAnchor | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  placement: Placement,
  offset = 6,
  align: "center" | "start" = "center",
  onPlace?: (placement: Placement) => void,
) {
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      const a = anchor.current;
      const f = floating.current;
      if (!a || !f) return;
      // A virtual anchor has no direction of its own: use the floating element's.
      const dir = getComputedStyle(a instanceof Element ? a : f).direction === "rtl" ? "rtl" : "ltr";
      const pos = computePosition(
        a.getBoundingClientRect(),
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
    update();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [anchor, floating, open, placement, offset, align, onPlace]);
}
