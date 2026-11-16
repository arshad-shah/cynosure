import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useCanvasSize } from "../../foundations/canvas-size.js";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import type { DragSession } from "../../foundations/drag.js";
import { stepKey } from "../../foundations/keys.js";
import { LiveRegion } from "../../foundations/LiveRegion/LiveRegion.js";
import { clamp } from "../../foundations/math.js";
import {
  anchoredScroll,
  clampPercent,
  MAX_PERCENT,
  MIN_PERCENT,
  type ZoomSetting,
} from "../../foundations/zoom.js";
import { useZoomGestures, type ZoomAnchor } from "../../foundations/zoom-gestures.js";

export type { ZoomSetting };

export interface CompareSliderTokens {
  /** Colour of the divider line and grip. */
  divider: string;
  /** Size of the grip on the divider. */
  gripSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    compareSlider: CompareSliderTokens;
  }
}

export interface CompareSliderLabels {
  /** Name of the divider. Default: "Comparison". */
  divider: string;
  /** Spoken position. Default: "40% before". */
  position: (percent: number) => string;
  /** Tags shown on the two sides. Defaults: "Before", "After". */
  before: string;
  after: string;
  /** Name of the zoomed view, a tab stop while it is larger than the frame. Default: "Zoomed comparison". */
  view: string;
  /** Announced when the zoom changes. Default: "Zoom 125%". */
  zoom: (percent: number) => string;
}

export interface CompareSliderProps {
  /**
   * Shown on the start side of the divider (e.g. the original image), stretched to the shared box; an `img`, `video`
   * or `canvas` is contained in it. Or give `beforeSrc`.
   */
  before?: ReactNode;
  /** Address of the start side's picture, drawn contained in the shared box, instead of `before`. */
  beforeSrc?: string | undefined;
  /** With `beforeSrc`: what its picture shows (`""` when the tags say it all). */
  beforeAlt?: string | undefined;
  /** Shown on the other side (e.g. the edited image), in the same box as `before`. Or give `afterSrc`. */
  after?: ReactNode;
  /** Address of the end side's picture, drawn contained in the shared box, instead of `after`. */
  afterSrc?: string | undefined;
  /** With `afterSrc`: what its picture shows. */
  afterAlt?: string | undefined;
  /** Divider position: percent of the width showing `before`. */
  value?: number | undefined;
  /** The divider's starting position when uncontrolled, 0 to 100. Default 50. */
  defaultValue?: number;
  /** Called as the divider moves (drag, click or keys), with the new position, 0 to 100. */
  onChange?: ((value: number) => void) | undefined;
  /**
   * How big the sides are shown, when you control it: `{ kind: "fit-page" }` fits the whole box in the frame (the
   * default), `fit-width` fits its width, and `{ kind: "percent", value }` is a percent of the picture's own size (100
   * is actual size: one picture pixel per CSS pixel). Larger than the frame, the sides pan. Pair with ZoomControls.
   */
  zoom?: ZoomSetting | undefined;
  /** The zoom at first, when uncontrolled. Default `{ kind: "fit-page" }`. */
  defaultZoom?: ZoomSetting;
  /** Called with the new setting when a gesture, a key or a ZoomControls changes the zoom. */
  onZoomChange?: ((zoom: ZoomSetting) => void) | undefined;
  /** The scale the zoom comes to (1 = actual size; fit depends on the frame): ZoomControls' `percent` is it times 100. */
  onScaleChange?: ((scale: number) => void) | undefined;
  /**
   * Zoom by gesture: Ctrl/Cmd+wheel (and a trackpad pinch) and a two-finger pinch around the pointer, and Ctrl/Cmd
   * with = - 0 while focus is inside. Default false: the page keeps Ctrl+wheel, and only `zoom` changes the zoom.
   */
  zoomable?: boolean;
  /** Show the Before and After tags. Default true. */
  showTags?: boolean;
  /** Replace the built-in English text: the divider's name, its spoken position and the two tags. */
  labels?: Partial<CompareSliderLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-compare-slider-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CompareSliderLabels = {
  divider: "Comparison",
  position: (p) => `${p}% before`,
  before: "Before",
  after: "After",
  view: "Zoomed comparison",
  zoom: (percent) => `Zoom ${percent}%`,
};

/** Arrow keys on the zoomed view pan it by this many pixels, five times as far with Shift (as PanZoomCanvas does). */
const STEP = 40;

/** Where a pan stops along one axis: the content (`size * k`) covers the frame, or is centred when smaller. */
const bound = (at: number, frame: number, k: number) =>
  frame * k > frame ? clamp(at, frame - frame * k, 0) : (frame - frame * k) / 2;

/**
 * Before and after, one over the other, split by a divider people move: drag anywhere (mouse, pen or a held finger),
 * click to jump, or focus the divider and use the arrow keys. An APG slider. Zoomed past the frame, both sides pan
 * together and the divider moves by its line.
 */
export function CompareSlider({
  before,
  after,
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  value,
  defaultValue = 50,
  onChange,
  zoom,
  defaultZoom = { kind: "fit-page" },
  onZoomChange,
  onScaleChange,
  zoomable = false,
  showTags = true,
  labels,
  className,
  style,
}: CompareSliderProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const area = useRef<HTMLDivElement>(null);
  const divider = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useControllableState(value, defaultValue, onChange);
  const position = clamp(own, 0, 100);
  // The position last set, read by a drag's handlers, which outlive the render they were made in.
  const latest = useRef(position);
  latest.current = position;
  const set = (next: number) => {
    const v = Math.round(clamp(next, 0, 100) * 10) / 10;
    // Only a real move is a change: a key at an end, or a pointer resting on one spot, tells nobody.
    if (v === latest.current) return;
    latest.current = v;
    setOwn(v);
  };
  const fromX = (x: number) => {
    const box = (area.current as HTMLDivElement).getBoundingClientRect();
    return ((x - box.left) / box.width) * 100;
  };

  const onDividerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The pictures do not mirror in RTL, so neither do the keys.
    const next = stepKey(event, { value: position, min: 0, max: 100, step: 1 });
    if (next === undefined) return;
    event.preventDefault();
    set(next);
  };

  // The shared box: the shape of the first picture, video or canvas (the before side's, else the after side's), once
  // its size is known. Until then (and with no media at all) the sides lay out in the flow, the taller one setting the
  // height.
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  useClientLayoutEffect(() => {
    const el = area.current as HTMLDivElement;
    const media =
      el.querySelector<HTMLElement>('[data-side="before"] :is(img, video, canvas)') ??
      el.querySelector<HTMLElement>('[data-side="after"] :is(img, video, canvas)');
    const measure = () => {
      const size =
        media instanceof HTMLImageElement
          ? { width: media.naturalWidth, height: media.naturalHeight }
          : media instanceof HTMLVideoElement
            ? { width: media.videoWidth, height: media.videoHeight }
            : media instanceof HTMLCanvasElement
              ? { width: media.width, height: media.height }
              : null;
      const next = size && size.width > 0 && size.height > 0 ? size : null;
      setNatural((last) => (last?.width === next?.width && last?.height === next?.height ? last : next));
    };
    measure();
    if (!media) return;
    media.addEventListener("load", measure);
    media.addEventListener("loadedmetadata", measure);
    return () => {
      media.removeEventListener("load", measure);
      media.removeEventListener("loadedmetadata", measure);
    };
  }, [before, after, beforeSrc, afterSrc]);

  // Zoom: a scale of the picture's own size. Fit is the box in the frame; with no media the box is its own size, so
  // fit is 100%. The sides are drawn at fit and scaled by `k` (scale over fit), panned by `x` and `y`.
  const frame = useCanvasSize(area);
  const [setting, setSetting] = useControllableState(zoom, defaultZoom, onZoomChange);
  const box = natural ?? frame;
  const measured = frame.width > 0 && frame.height > 0 && box.width > 0 && box.height > 0;
  const fitWidth = measured ? frame.width / box.width : 1;
  const fit = measured ? Math.min(fitWidth, frame.height / box.height) : 1;
  // The limits take in fit, so a huge picture fits below 25% and a tiny one above 800%, and zooming out from a fit
  // never jumps in.
  const lo = Math.min(MIN_PERCENT, Math.floor(fit * 100));
  const hi = Math.max(MAX_PERCENT, Math.ceil(fit * 100));
  const cap = setting.kind !== "percent" && setting.max ? clampPercent(setting.max, lo, hi) / 100 : Infinity;
  const scale =
    setting.kind === "percent"
      ? clampPercent(setting.value, lo, hi) / 100
      : Math.min(cap, setting.kind === "fit-width" ? fitWidth : fit);
  const k = scale / fit;
  const percent = Math.round(scale * 100);

  // The pan, kept inside the content; a zoom keeps the point under the pointer (or the frame's middle) in place.
  const anchor = useRef<ZoomAnchor>(null);
  const [view, setView] = useState({ k, x: 0, y: 0, width: frame.width, height: frame.height });
  let current = view;
  if (view.k !== k || view.width !== frame.width || view.height !== frame.height) {
    const a = anchor.current ?? { x: frame.width / 2, y: frame.height / 2 };
    const to = anchoredScroll({ left: -view.x, top: -view.y }, a, k / view.k);
    anchor.current = null;
    const { width, height } = frame;
    current = { k, x: bound(-to.left, width, k), y: bound(-to.top, height, k), width, height };
    setView(current);
  }
  const pannable = frame.width * k > frame.width + 0.5 || frame.height * k > frame.height + 0.5;
  const panTo = (x: number, y: number) =>
    setView((v) => ({ ...v, x: bound(x, v.width, v.k), y: bound(y, v.height, v.k) }));
  const panBy = (dx: number, dy: number) =>
    setView((v) => ({ ...v, x: bound(v.x + dx, v.width, v.k), y: bound(v.y + dy, v.height, v.k) }));

  const reported = useRef<number | null>(null);
  const report = useRef(onScaleChange);
  report.current = onScaleChange;
  useEffect(() => {
    if (!frame.width || reported.current === scale) return;
    reported.current = scale;
    report.current?.(scale);
  });

  // Pointer, through detent: a press on the divider's line drags the divider; elsewhere it pans while the sides are
  // larger than the frame, and otherwise jumps the divider there and drags it. The frame keeps touch-action pan-y
  // until it pans, so a sideways finger moves the divider and an upward swipe still scrolls the page (the browser then
  // cancels the drag, which puts things back, as Escape does).
  const gestures = useZoomGestures(area, {
    percent,
    min: lo,
    max: hi,
    zoomable,
    onZoom: (next, at) => {
      anchor.current = at;
      setSetting({ kind: "percent", value: next });
    },
    onPan: pannable ? panBy : undefined,
    claim: (session: DragSession) => {
      if (pannable && !session.path.includes(divider.current as EventTarget)) {
        const from = { x: current.x, y: current.y };
        area.current?.focus({ preventScroll: true });
        return {
          onMove: ({ delta }) => panTo(from.x + delta.x, from.y + delta.y),
          onEnd: (_, cancelled) => cancelled && panTo(from.x, from.y),
        };
      }
      const from = position;
      divider.current?.focus({ preventScroll: true });
      set(fromX(session.point.x));
      return {
        onMove: ({ point }) => set(fromX(point.x)),
        onEnd: (_, cancelled) => cancelled && set(from),
      };
    },
  });
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    gestures.onKeyDown(event);
    if (event.defaultPrevented || event.target !== event.currentTarget || !pannable) return;
    const by = event.shiftKey ? STEP * 5 : STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [by, 0],
      ArrowRight: [-by, 0],
      ArrowUp: [0, by],
      ArrowDown: [0, -by],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    panBy(...move);
  };

  // A new zoom setting is announced with the percent it comes to; the first one, and a fit following the frame's size,
  // are not.
  const key = setting.kind === "percent" ? `${setting.value}` : setting.kind;
  const [said, setSaid] = useState({ key, text: "" });
  if (said.key !== key) setSaid({ key, text: text.zoom(percent) });

  const stage = {
    transform: `translate(${current.x}px, ${current.y}px) scale(${current.k})`,
  };
  const side = (which: "before" | "after", content: ReactNode, src?: string, alt?: string) => (
    <div className="cy-compare-slider-layer cy-reset" data-side={which}>
      <div className="cy-compare-slider-stage cy-reset" style={stage}>
        {src === undefined ? (
          content
        ) : (
          <img
            className="cy-compare-slider-img cy-reset"
            src={src}
            alt={alt ?? ""}
            draggable={false}
            decoding="async"
          />
        )}
      </div>
    </div>
  );

  const shown = Math.round(position);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the zoom keys from the divider bubble here; zoomed, it is a group that pans
    <div
      ref={area}
      className={className ? `cy-compare-slider ${className}` : "cy-compare-slider"}
      data-boxed={natural ? "" : undefined}
      data-pannable={pannable ? "" : undefined}
      data-panning={gestures.panning ? "" : undefined}
      // Zoomed past the frame, the view is a named tab stop whose arrows pan it.
      {...(pannable ? { tabIndex: 0, role: "group", "aria-label": text.view } : {})}
      onKeyDown={onKeyDown}
      onKeyUp={gestures.onKeyUp}
      onBlur={gestures.onBlur}
      style={
        {
          "--_pos": `${position}%`,
          ...(natural ? { "--_ratio": `${natural.width} / ${natural.height}` } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {side("after", after, afterSrc, afterAlt)}
      {side("before", before, beforeSrc, beforeAlt)}
      {showTags && (
        <>
          <span className="cy-compare-slider-tag cy-reset" data-side="before" aria-hidden="true">
            {text.before}
          </span>
          <span className="cy-compare-slider-tag cy-reset" data-side="after" aria-hidden="true">
            {text.after}
          </span>
        </>
      )}
      <div
        ref={divider}
        role="slider"
        tabIndex={0}
        aria-label={text.divider}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={shown}
        aria-valuetext={text.position(shown)}
        className="cy-compare-slider-divider cy-reset"
        onKeyDown={onDividerKeyDown}
      >
        <span className="cy-compare-slider-grip cy-reset" aria-hidden="true" />
      </div>
      <LiveRegion>{said.text}</LiveRegion>
    </div>
  );
}
