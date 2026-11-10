import { bindPointer, type DragSession } from "@arshad-shah/detent";
import { type RefObject, useEffect, useRef } from "react";

export type { DragSession };

export interface DragOptions {
  /** Pixels a mouse or pen travels before the drag starts. Default 0: the press itself starts it. */
  distance?: number;
  /**
   * Milliseconds a finger is held before the drag starts. Default 0, for small controls a swipe never needs to scroll
   * through (a slider, a divider); give detent's 200 for large areas the page must still scroll over.
   */
  delay?: number;
  /**
   * "none" (default): a finger on the element always drags. "css": the component's CSS decides, e.g. `pan-y` on a
   * horizontal slider so a vertical swipe still scrolls the page (the browser then cancels the drag).
   */
  touchAction?: "none" | "css";
  /**
   * Return false to refuse the drag (disabled, nothing to drag here). `session.path` is the press's own path; by the
   * time a drag starts after some travel, `session.event` is a move on the window.
   */
  onStart?: (session: DragSession) => unknown;
  onMove?: (session: DragSession) => void;
  /** `cancelled` when Escape (or the browser) cancelled it: put things back. */
  onEnd?: (session: DragSession, cancelled: boolean) => void;
}

/**
 * Pointer dragging on `ref` through detent (rule 7): mouse, pen and touch alike, one pointer at a time, tracked on
 * `window` so it survives leaving the element, and Escape cancels. Bound once; the handlers are read fresh on every
 * event, so they can close over the latest props and state.
 */
export function useDrag(ref: RefObject<HTMLElement | null>, options: DragOptions) {
  const latest = useRef(options);
  latest.current = options;
  const { distance = 0, delay = 0, touchAction = "none" } = options;
  const config = `${distance}|${delay}|${touchAction}`;
  const bound = useRef<{ el: HTMLElement; config: string; handle: { destroy(): void } } | null>(null);
  // Checked after every render: the element can mount later (inside a popover) or be replaced.
  useEffect(() => {
    const el = ref.current;
    if (bound.current?.el === el && bound.current.config === config) return;
    bound.current?.handle.destroy();
    bound.current = null;
    if (!el) return;
    const handle = bindPointer(el, {
      distance,
      delay,
      onStart: (session) => {
        // Only the main button drags (detent checks mice; this covers pens' barrel buttons too). The start event is the
        // press itself, or a move after some travel, which reports the buttons held instead.
        const e = session.event;
        if (e.type === "pointerdown" ? e.button > 0 : e.buttons > 0 && (e.buttons & 1) === 0) return false;
        return latest.current.onStart?.(session) !== false;
      },
      onMove: (session) => latest.current.onMove?.(session),
      onEnd: (session, cancelled) => latest.current.onEnd?.(session, cancelled),
    });
    // detent always writes an inline touch-action; clear it so the stylesheet's applies (detent restores it on destroy).
    if (touchAction === "css") el.style.touchAction = "";
    bound.current = { el, config, handle };
  });
  useEffect(
    () => () => {
      bound.current?.handle.destroy();
      bound.current = null;
    },
    [],
  );
}
