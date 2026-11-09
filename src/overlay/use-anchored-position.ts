import { type RefObject, useLayoutEffect } from "react";
import { computePosition, type Placement } from "./position.js";

/** Keeps a fixed-position floating element anchored to `anchor` while `open` (scroll and resize aware). */
export function useAnchoredPosition(
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  placement: Placement,
  offset = 6,
  onPlace?: (placement: Placement) => void,
) {
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      const a = anchor.current;
      const f = floating.current;
      if (!a || !f) return;
      const dir = getComputedStyle(a).direction === "rtl" ? "rtl" : "ltr";
      const pos = computePosition(
        a.getBoundingClientRect(),
        { width: f.offsetWidth, height: f.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
        placement,
        offset,
        dir,
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
  }, [anchor, floating, open, placement, offset, onPlace]);
}
