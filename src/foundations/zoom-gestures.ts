import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";
import { useDrag } from "./drag.js";
import { clamp } from "./math.js";
import { clampPercent, MAX_PERCENT, MIN_PERCENT, zoomStep } from "./zoom.js";

/** Where a zoom is centred, in pixels from the viewport's top left; null for its centre (a key or a button). */
export type ZoomAnchor = { x: number; y: number } | null;

export interface ZoomGestureOptions {
  /** The percent shown now. */
  percent: number;
  onZoom: (percent: number, anchor: ZoomAnchor) => void;
  /**
   * Pan something other than the element's scroll position (a canvas's transform), by a step in pixels. Then the wheel
   * pans too, one finger pans on touch, and a press on the element itself (its empty background, not what is drawn on
   * it) pans without Space.
   */
  onPan?: ((dx: number, dy: number) => void) | undefined;
  /** The smallest percent the wheel, a pinch and the keys go to. Default 25. */
  min?: number | undefined;
  /** The largest percent the wheel, a pinch and the keys go to. Default 800. */
  max?: number | undefined;
}

/**
 * Zoom and pan for a scrolling viewport, as document and image editors do:
 * - Ctrl/Cmd+wheel (and a trackpad pinch, which browsers send as one) zooms around the pointer;
 * - two fingers pinch-zoom around their midpoint (one finger scrolls natively);
 * - Space+drag pans with a mouse or pen (through detent);
 * - Ctrl/Cmd and =, - or 0 zoom in, out and to 100% while focus is inside.
 * Spread the returned handlers on the viewport; `panning` is true while Space is held (show a grab cursor).
 * With `onPan` (a canvas rather than a scroller) the pans go to it instead, and more gestures pan; see `onPan`.
 */
export function useZoomGestures(
  scroller: RefObject<HTMLElement | null>,
  { percent, onZoom, onPan, min = MIN_PERCENT, max = MAX_PERCENT }: ZoomGestureOptions,
) {
  const latest = useRef({ percent, onZoom, onPan, min, max });
  latest.current = { percent, onZoom, onPan, min, max };
  /** True while two fingers are down: the first one's drag must not pan meanwhile. */
  const pinching = useRef(false);
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
      const p = clampPercent(next, latest.current.min, latest.current.max);
      if (p !== latest.current.percent) latest.current.onZoom(p, anchor);
      return p;
    };
    // The wheel's zoom, unrounded: a slow trackpad pinch sends steps far under 1%, which rounding each one would lose.
    // It starts again from `percent` when something else (a key, a button, a pinch) changed the zoom.
    let wheel = { exact: latest.current.percent, reported: latest.current.percent };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        const pan = latest.current.onPan;
        if (!pan) return;
        e.preventDefault();
        pan(-e.deltaX, -e.deltaY);
        return;
      }
      // The browser's own page zoom must not happen on top of ours.
      e.preventDefault();
      const { percent: shown, min: lo, max: hi } = latest.current;
      if (shown !== wheel.reported) wheel = { exact: shown, reported: shown };
      const exact = clamp(wheel.exact * Math.exp(-e.deltaY * 0.0015), lo, hi);
      wheel = { exact, reported: zoomTo(exact, at(e.clientX, e.clientY)) };
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
      if (touches.size === 2) {
        pinch = { distance: spread().distance || 1, percent: latest.current.percent };
        pinching.current = true;
      }
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
      if (touches.size === 0) pinching.current = false;
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

  // Space+drag pans with a mouse or pen; a scroller's finger pans natively (it keeps touch-action pan-x pan-y). With
  // `onPan`, a press on the element's own background pans too, and so does a finger.
  const last = useRef({ x: 0, y: 0 });
  useDrag(scroller, {
    touchAction: "css",
    onStart: ({ pointerType, path }) => {
      const custom = !!latest.current.onPan;
      const background = custom && path[0] === scroller.current;
      if (pointerType === "touch" ? !background : !panningRef.current && !background) return false;
      last.current = { x: 0, y: 0 };
    },
    onMove: ({ delta }) => {
      const dx = delta.x - last.current.x;
      const dy = delta.y - last.current.y;
      last.current = { x: delta.x, y: delta.y };
      if (pinching.current) return;
      const pan = latest.current.onPan;
      if (pan) pan(dx, dy);
      else {
        const el = scroller.current as HTMLElement;
        el.scrollLeft -= dx;
        el.scrollTop -= dy;
      }
    },
  });

  return {
    panning,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const { percent: p, onZoom: zoom, min: lo, max: hi } = latest.current;
      if (event.ctrlKey || event.metaKey) {
        const next =
          event.key === "=" || event.key === "+"
            ? zoomStep(p, 1, lo, hi)
            : event.key === "-"
              ? zoomStep(p, -1, lo, hi)
              : event.key === "0"
                ? clampPercent(100, lo, hi)
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
