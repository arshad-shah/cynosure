import { bindPointer } from "@arshad-shah/detent";
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  angleFrom,
  type FrameBox,
  type FrameHandle,
  type FrameLimits,
  moveBy,
  resizeBy,
  resizeByKey,
} from "./frame-math.js";

export interface SelectionFrameTokens {
  /** Outline and handle colour. */
  color: string;
  /** Visible size of a handle. */
  handleSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    selectionFrame: SelectionFrameTokens;
  }
}

export interface SelectionFrameLabels {
  /** How screen readers call the frame. Default: "selection". */
  roleDescription: string;
}

export interface SelectionFrameProps {
  /** Accessible name, e.g. "Text box: Hello". Describe the keys nearby with `aria-describedby`. */
  label: string;
  /** Where the object is, in your units (page points, canvas pixels). */
  box: FrameBox;
  /** Degrees, clockwise. */
  rotate?: number;
  /** CSS pixels per unit (the zoom). Default 1. */
  scale?: number;
  resizable?: boolean;
  rotatable?: boolean;
  /** Keep the width-to-height ratio while resizing (Shift does it for one drag). */
  keepAspect?: boolean;
  /** Smallest width and height, in units. Default 1. */
  minSize?: number;
  /** Keep the object inside this area (units). */
  bounds?: { width: number; height: number } | undefined;
  /** Arrow keys move (and Alt+arrows resize) by this many units; Shift by `largeStep`. Defaults 1 and 10. */
  step?: number;
  largeStep?: number;
  /** Adjust every proposed box, e.g. snap to a grid or to other objects. */
  snap?: ((box: FrameBox) => FrameBox) | undefined;
  /** Every change while dragging or holding a key (a preview). */
  onChange?: ((box: FrameBox, rotate: number) => void) | undefined;
  /** The end of one change: pointer up, key up or Enter. One undo step. */
  onCommit: (box: FrameBox, rotate: number) => void;
  "aria-describedby"?: string | undefined;
  labels?: Partial<SelectionFrameLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-selection-frame-* tokens. */
  style?: CSSProperties;
}

const HANDLES: FrameHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface Live {
  box: FrameBox;
  rotate: number;
  start: { box: FrameBox; rotate: number };
}

/**
 * Move, resize and rotate one selected object: drag it or its handles (mouse, pen or touch, through detent), or focus
 * it and use the keys. You own the geometry: `onChange` previews, `onCommit` ends each change (one undo step), and
 * Escape cancels back to where it started. Place it in a positioned layer over your canvas or page.
 */
export function SelectionFrame({
  label,
  box,
  rotate = 0,
  scale = 1,
  resizable = false,
  rotatable = false,
  keepAspect = false,
  minSize = 1,
  bounds,
  step = 1,
  largeStep = 10,
  snap,
  onChange,
  onCommit,
  "aria-describedby": describedBy,
  labels,
  className,
  style,
}: SelectionFrameProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<Live | null>(null);
  const liveRef = useRef<Live | null>(null);
  // Pointer handlers are bound once; they read the latest props through this ref.
  const props = useRef({ box, rotate, scale, keepAspect, snap, onChange, onCommit });
  props.current = { box, rotate, scale, keepAspect, snap, onChange, onCommit };
  const limits: FrameLimits = { minSize, bounds };
  const limitsRef = useRef(limits);
  limitsRef.current = limits;

  // The last committed geometry, until new props arrive: a second key press or drag can begin before the parent
  // re-renders with the first one's result.
  const seen = useRef({ box, rotate });
  const latest = useRef({ box, rotate });
  if (seen.current.box !== box || seen.current.rotate !== rotate) {
    seen.current = { box, rotate };
    latest.current = { box, rotate };
  }

  const set = (next: Live | null) => {
    liveRef.current = next;
    setLive(next);
  };
  const change = (nextBox: FrameBox, nextRotate: number) => {
    const p = props.current;
    const start = liveRef.current?.start ?? latest.current;
    const snapped = p.snap ? p.snap(nextBox) : nextBox;
    set({ box: snapped, rotate: nextRotate, start });
    p.onChange?.(snapped, nextRotate);
  };
  const commit = () => {
    const current = liveRef.current;
    if (!current) return;
    set(null);
    latest.current = { box: current.box, rotate: current.rotate };
    props.current.onCommit(current.box, current.rotate);
  };
  const cancel = () => {
    const current = liveRef.current;
    if (!current) return;
    set(null);
    props.current.onChange?.(current.start.box, current.start.rotate);
  };

  // Pointer gestures through detent: the frame moves, each handle resizes or rotates. Escape cancels a drag.
  useEffect(() => {
    const el = frame.current as HTMLDivElement;
    const begin = () => {
      const from = latest.current;
      set({ ...from, start: from });
      el.focus({ preventScroll: true });
    };
    const end = (_: unknown, cancelled: boolean) => (cancelled ? cancel() : commit());
    const bound = [
      bindPointer(el, {
        cancel: "[data-handle]",
        onStart: (session) => {
          if (session.event.button !== 0) return false;
          begin();
        },
        onMove: ({ delta }) => {
          const { box: b0, rotate: r0 } = (liveRef.current as Live).start;
          const k = props.current.scale;
          change(moveBy(b0, delta.x / k, delta.y / k, limitsRef.current), r0);
        },
        onEnd: end,
      }),
      ...[...el.querySelectorAll<HTMLElement>("[data-handle]")].map((handle) =>
        bindPointer(handle, {
          distance: 0,
          delay: 0,
          onStart: () => begin(),
          onMove: ({ delta, point, event }) => {
            const { box: b0, rotate: r0 } = (liveRef.current as Live).start;
            const name = handle.dataset.handle as FrameHandle | "rotate";
            if (name === "rotate") {
              const r = el.getBoundingClientRect();
              const deg = angleFrom(r.left + r.width / 2, r.top + r.height / 2, point.x, point.y);
              change(b0, event.shiftKey ? Math.round(deg / 15) * 15 : deg);
              return;
            }
            const k = props.current.scale;
            const aspect = props.current.keepAspect || event.shiftKey;
            change(resizeBy(b0, name, delta.x / k, delta.y / k, r0, aspect, limitsRef.current), r0);
          },
          onEnd: end,
        }),
      ),
    ];
    return () => {
      for (const b of bound) b.destroy();
    };
    // Rebind when the set of handles changes.
  }, [resizable, rotatable]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const current = liveRef.current ?? latest.current;
    const by = event.shiftKey ? largeStep : step;
    if (event.key === "Escape" || event.key === "Enter") {
      if (!liveRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") cancel();
      else commit();
      return;
    }
    if (rotatable && (event.key === "[" || event.key === "]")) {
      event.preventDefault();
      change(current.box, current.rotate + (event.key === "]" ? 15 : -15));
      return;
    }
    const dir = ARROWS[event.key];
    if (!dir) return;
    // Alt+Left would otherwise go back in history.
    event.preventDefault();
    if (event.altKey) {
      if (resizable)
        change(resizeByKey(current.box, event.key, by, current.rotate, keepAspect, limits), current.rotate);
      return;
    }
    change(moveBy(current.box, dir[0] * by, dir[1] * by, limits), current.rotate);
  };
  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (ARROWS[event.key] || event.key === "[" || event.key === "]") commit();
  };

  const shown = live ?? { box, rotate };
  return (
    // biome-ignore lint/a11y/useSemanticElements: an object frame, not a group of form controls (fieldset)
    <div
      ref={frame}
      role="group"
      aria-label={label}
      aria-roledescription={labels?.roleDescription ?? "selection"}
      aria-describedby={describedBy}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the frame is the keyboard handle for moving the object
      tabIndex={0}
      className={className ? `cy-selection-frame ${className}` : "cy-selection-frame"}
      data-moving={live ? "" : undefined}
      style={
        {
          "--_x": `${shown.box.x * scale}px`,
          "--_y": `${shown.box.y * scale}px`,
          "--_w": `${shown.box.width * scale}px`,
          "--_h": `${shown.box.height * scale}px`,
          "--_r": `${shown.rotate}deg`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {resizable &&
        HANDLES.map((name) => (
          <span
            key={name}
            data-handle={name}
            className="cy-selection-frame-handle cy-reset"
            aria-hidden="true"
          />
        ))}
      {rotatable && (
        <span
          data-handle="rotate"
          className="cy-selection-frame-handle cy-selection-frame-rotate cy-reset"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
