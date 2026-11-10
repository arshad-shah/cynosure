import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";
import { useDrag } from "./drag.js";
import { clampPercent, zoomStep } from "./zoom.js";

/** Where a zoom is centred, in pixels from the viewport's top left; null for its centre (a key or a button). */
export type ZoomAnchor = { x: number; y: number } | null;

export interface ZoomGestureOptions {
  /** The percent shown now. */
  percent: number;
  onZoom: (percent: number, anchor: ZoomAnchor) => void;
}

/**
 * Zoom and pan for a scrolling viewport, as document and image editors do:
 * - Ctrl/Cmd+wheel (and a trackpad pinch, which browsers send as one) zooms around the pointer;
 * - two fingers pinch-zoom around their midpoint (one finger scrolls natively);
 * - Space+drag pans with a mouse or pen (through detent);
 * - Ctrl/Cmd and =, - or 0 zoom in, out and to 100% while focus is inside.
 * Spread the returned handlers on the viewport; `panning` is true while Space is held (show a grab cursor).
 */
export function useZoomGestures(
  scroller: RefObject<HTMLElement | null>,
  { percent, onZoom }: ZoomGestureOptions,
) {
  const latest = useRef({ percent, onZoom });
  latest.current = { percent, onZoom };
  const [panning, setPanning] = useState(false);
  const panningRef = useRef(false);
  const setPan = (on: boolean) => {
    panningRef.current = on;
    setPanning(on);
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const at = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      return { x: x - r.left, y: y - r.top };
    };
    const zoomTo = (next: number, anchor: ZoomAnchor) => {
      const p = clampPercent(next);
      if (p !== latest.current.percent) latest.current.onZoom(p, anchor);
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      // The browser's own page zoom must not happen on top of ours.
      e.preventDefault();
      zoomTo(latest.current.percent * Math.exp(-e.deltaY * 0.0015), at(e.clientX, e.clientY));
    };
    // Pinch: two touches. detent follows one pointer at a time, so the pair is tracked here.
    const touches = new Map<number, { x: number; y: number }>();
    let pinch: { distance: number; percent: number } | null = null;
    const spread = () => {
      const [a, b] = [...touches.values()] as [{ x: number; y: number }, { x: number; y: number }];
      return { distance: Math.hypot(a.x - b.x, a.y - b.y), mid: at((a.x + b.x) / 2, (a.y + b.y) / 2) };
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) pinch = { distance: spread().distance || 1, percent: latest.current.percent };
    };
    const onMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!pinch || touches.size !== 2) return;
      const { distance, mid } = spread();
      zoomTo((pinch.percent * distance) / pinch.distance, mid);
    };
    const onUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = null;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [scroller]);

  // Space+drag pans. A finger pans natively (the viewport keeps touch-action pan-x pan-y).
  const from = useRef({ left: 0, top: 0 });
  useDrag(scroller, {
    touchAction: "css",
    onStart: ({ pointerType }) => {
      if (!panningRef.current || pointerType === "touch") return false;
      const el = scroller.current as HTMLElement;
      from.current = { left: el.scrollLeft, top: el.scrollTop };
    },
    onMove: ({ delta }) => {
      const el = scroller.current as HTMLElement;
      el.scrollLeft = from.current.left - delta.x;
      el.scrollTop = from.current.top - delta.y;
    },
  });

  return {
    panning,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const { percent: p, onZoom: zoom } = latest.current;
      if (event.ctrlKey || event.metaKey) {
        const next =
          event.key === "=" || event.key === "+"
            ? zoomStep(p, 1)
            : event.key === "-"
              ? zoomStep(p, -1)
              : event.key === "0"
                ? 100
                : null;
        if (next === null) return;
        event.preventDefault();
        if (next !== p) zoom(next, null);
        return;
      }
      // Space on the viewport itself (not in a field inside it) holds the hand tool.
      if (event.key === " " && event.target === event.currentTarget) {
        event.preventDefault();
        if (!panningRef.current) setPan(true);
      }
    },
    onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === " " && panningRef.current) setPan(false);
    },
    onBlur: () => panningRef.current && setPan(false),
  };
}
