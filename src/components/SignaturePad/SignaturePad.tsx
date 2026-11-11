import { type CSSProperties, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { type InkPoint, type InkStroke, type InkWeight, inkPath, inkPoint } from "./ink.js";

export interface SignaturePadTokens {
  /** Ink colour when no `ink` is given (follows light and dark modes). */
  ink: string;
  /** Background of the pad. */
  background: string;
  /** Height when no `height` is given. */
  height: string;
  /** Colour of the guide line people sign on. */
  guide: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    signaturePad: SignaturePadTokens;
  }
}

export interface SignaturePadProps {
  /** Accessible name, e.g. "Draw your signature". */
  label: string;
  /** The strokes so far, in the pad's coordinate space. */
  value: InkStroke[];
  /** Called once per finished stroke with the new list. Undo and clear are yours (slice or empty the list). */
  onChange: (strokes: InkStroke[]) => void;
  /** Ink colour (any CSS colour). Default: the ink token, so it follows dark mode on screen. */
  ink?: string | undefined;
  /** Nib size. Default `medium`. */
  weight?: InkWeight;
  /**
   * The coordinate space strokes are recorded in. Without it strokes are in shown CSS pixels; with it a signature keeps
   * its shape and weight however big the pad is shown (phone width, text size, a resize while drawing).
   */
  space?: { width: number; height: number } | undefined;
  /** Fixed size in CSS pixels. Default: the full width, and the height token. */
  width?: number | undefined;
  height?: number | undefined;
  disabled?: boolean;
  /** Ids of text that explains the pad (e.g. "Or type your name instead"). */
  "aria-describedby"?: string | undefined;
  className?: string;
  /** Layout only. Restyle through --cy-signature-pad-* tokens. */
  style?: CSSProperties;
}

/** Samples closer than this (pad units) to the last one add nothing. */
const MIN_STEP = 0.75;
/** Touches are ignored for this long after a pen was last seen: a resting palm. */
const PALM_MS = 3000;

/**
 * A pad to draw a signature with a mouse, finger or pen. A pen's pressure and tilt shape the line; mouse and touch draw
 * a steady line. One pointer draws at a time, and a palm resting while a pen is in use is ignored. It draws, nothing
 * more: offer typing or uploading a signature beside it for people who cannot draw.
 */
export function SignaturePad({
  label,
  value,
  onChange,
  ink,
  weight = "medium",
  space,
  width,
  height,
  disabled = false,
  "aria-describedby": describedBy,
  className,
  style,
}: SignaturePadProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  // Several pointer events can arrive between renders: the stroke in progress lives in a ref; state mirrors it.
  const liveRef = useRef<InkStroke | null>(null);
  const pointer = useRef<number | null>(null);
  const penSeen = useRef(Number.NEGATIVE_INFINITY);
  const [live, setLive] = useState<InkStroke | null>(null);
  // The latest list, updated the moment a stroke ends: a second stroke can finish before React re-renders.
  const committed = useRef(value);
  committed.current = value;
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = canvas.current as HTMLCanvasElement;
    const measure = () =>
      setSize((s) =>
        s.width === el.clientWidth && s.height === el.clientHeight
          ? s
          : { width: el.clientWidth, height: el.clientHeight },
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const paint = useCallback(() => {
    const el = canvas.current as HTMLCanvasElement;
    const dpr = window.devicePixelRatio;
    el.width = Math.round(size.width * dpr);
    el.height = Math.round(size.height * dpr);
    const ctx = el.getContext("2d") as CanvasRenderingContext2D;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (space && size.width > 0) ctx.scale(size.width / space.width, size.height / space.height);
    ctx.fillStyle = ink ?? getComputedStyle(el).color;
    for (const stroke of live ? [...value, live] : value) {
      // Every stroke has at least its first sample, so it always has an outline.
      ctx.fill(new Path2D(inkPath(stroke, weight)));
    }
  }, [value, live, ink, weight, space, size]);
  useEffect(paint, [paint]);

  const sample = (event: PointerEvent<HTMLCanvasElement>, stroke: InkStroke): InkStroke => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scale = space ? { x: space.width / rect.width, y: space.height / rect.height } : undefined;
    const native = event.nativeEvent;
    // Coalesced events keep a fast stroke smooth: the browser batches several samples into one event.
    const samples = native.getCoalescedEvents?.() ?? [];
    let out = stroke;
    for (const e of samples.length ? samples : [native]) {
      const prev: InkPoint | null = out[out.length - 1] ?? null;
      const p = inkPoint(e, rect, prev, scale);
      if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) < MIN_STEP) continue;
      out = [...out, p];
    }
    return out;
  };

  const ours = (event: PointerEvent) => liveRef.current !== null && event.pointerId === pointer.current;
  const notePen = (event: PointerEvent) => {
    if (event.pointerType === "pen") penSeen.current = event.timeStamp;
  };
  const finish = (event: PointerEvent<HTMLCanvasElement>) => {
    notePen(event);
    if (!ours(event)) return;
    const stroke = liveRef.current as InkStroke;
    liveRef.current = null;
    pointer.current = null;
    setLive(null);
    committed.current = [...committed.current, stroke];
    onChange(committed.current);
  };

  return (
    <div
      className={className ? `cy-signature-pad ${className}` : "cy-signature-pad"}
      data-disabled={disabled ? "" : undefined}
      style={{ ...(width ? { inlineSize: width } : {}), ...(height ? { blockSize: height } : {}), ...style }}
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        className="cy-signature-pad-canvas cy-reset"
        onPointerDown={(event) => {
          notePen(event);
          // One stroke at a time: a second finger or a resting palm does not take over.
          if (disabled || liveRef.current) return;
          // Only the tip (or the main mouse button) draws, not a pen's barrel button or eraser.
          if (event.pointerType !== "touch" && event.button !== 0) return;
          if (event.pointerType === "touch" && event.timeStamp - penSeen.current < PALM_MS) return;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Synthetic events have no active pointer to capture.
          }
          pointer.current = event.pointerId;
          liveRef.current = sample(event, []);
          setLive(liveRef.current);
        }}
        onPointerMove={(event) => {
          notePen(event);
          if (!ours(event)) return;
          liveRef.current = sample(event, liveRef.current as InkStroke);
          setLive(liveRef.current);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        // A long press opens the context menu on Windows and Android, which would cancel the stroke.
        onContextMenu={(event) => event.preventDefault()}
      />
    </div>
  );
}
