import {
  type CSSProperties,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { useDrag } from "../../foundations/drag.js";
import { clamp } from "../../foundations/math.js";
import { clampPercent, MAX_PERCENT, MIN_PERCENT } from "../../foundations/zoom.js";
import { useZoomGestures, type ZoomAnchor } from "../../foundations/zoom-gestures.js";

export interface PanZoomCanvasTokens {
  /** Behind the content. */
  background: string;
  /** Width of the minimap. */
  minimapWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    panZoomCanvas: PanZoomCanvasTokens;
  }
}

/** Where the canvas is: a point at canvas (x, y) shows at screen (x times scale plus view.x, y times scale plus view.y). */
export interface CanvasView {
  x: number;
  y: number;
  /** 1 = 100%; kept between 25% and 800%. */
  scale: number;
}

export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanZoomCanvasHandle {
  /** Fits `bounds` (or a given rect) in view. */
  fit: (rect?: CanvasRect) => void;
  /** Zooms to a percent around the viewport's centre. */
  zoomTo: (percent: number) => void;
  /** Centres a rect (a node) without changing the zoom. */
  centreOn: (rect: CanvasRect) => void;
}

export interface PanZoomCanvasLabels {
  /** Announced when the zoom changes. Default "Zoom 125%". */
  zoom: (percent: number) => string;
}

export interface PanZoomCanvasProps {
  /** Names the canvas ("Schema diagram"). */
  label: string;
  view?: CanvasView | undefined;
  /** Where it starts. Default: `bounds` fitted in view (or the origin at 100% without bounds). */
  defaultView?: CanvasView;
  onViewChange?: ((view: CanvasView) => void) | undefined;
  /** The content's extent in canvas units, for fitting and the minimap. */
  bounds?: CanvasRect | undefined;
  /** Show a minimap of `bounds` with the view on it (drag it, or press where to look). */
  minimap?: boolean;
  /** A small drawing of the content for the minimap, in canvas units (it is scaled down). */
  renderMinimap?: () => ReactNode;
  /** The content, placed in canvas units (absolutely positioned children). */
  children?: ReactNode;
  labels?: Partial<PanZoomCanvasLabels>;
  className?: string;
  /** Layout only (give it a height). Restyle through --cy-pan-zoom-canvas-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: PanZoomCanvasLabels = { zoom: (percent) => `Zoom ${percent}%` };
const MIN = MIN_PERCENT / 100;
const MAX = MAX_PERCENT / 100;
/** Pixels an arrow key pans (Shift: five times as far). */
const STEP = 40;

/**
 * A surface to pan and zoom freely in both directions, for diagrams, maps and boards: products place their content in
 * canvas units and keep their own layout and drawing. Drag the empty background (or hold Space and drag) to pan, the
 * wheel pans, Ctrl/Cmd+wheel and a pinch zoom around the pointer, one finger pans on touch; arrow keys pan, Ctrl/Cmd
 * and = - 0 zoom, Shift+1 fits. On the same zoom core as DocumentViewport.
 */
export const PanZoomCanvas = forwardRef<PanZoomCanvasHandle, PanZoomCanvasProps>(function PanZoomCanvas(
  {
    label,
    view,
    defaultView,
    onViewChange,
    bounds,
    minimap = false,
    renderMinimap,
    children,
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const surface = useRef<HTMLElement>(null);
  const [current, setView] = useControllableState(
    view,
    defaultView ?? { x: 0, y: 0, scale: 1 },
    onViewChange,
  );
  const latest = useRef(current);
  latest.current = current;
  const [size, setSize] = useState({ width: 0, height: 0 });
  useClientLayoutEffect(() => {
    const el = surface.current as HTMLElement;
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

  const go = (next: CanvasView) => {
    latest.current = next;
    setView(next);
  };
  const zoomAround = (scale: number, at: { x: number; y: number }) => {
    const v = latest.current;
    const s = clamp(scale, MIN, MAX);
    go({ x: at.x - ((at.x - v.x) * s) / v.scale, y: at.y - ((at.y - v.y) * s) / v.scale, scale: s });
  };
  const centre = () => ({ x: size.width / 2, y: size.height / 2 });
  const fit = (rect = bounds) => {
    if (!rect || !size.width || !size.height) return;
    const pad = Math.min(size.width, size.height) * 0.05;
    const s = clamp(
      Math.min((size.width - 2 * pad) / rect.width, (size.height - 2 * pad) / rect.height),
      MIN,
      MAX,
    );
    go({
      x: (size.width - rect.width * s) / 2 - rect.x * s,
      y: (size.height - rect.height * s) / 2 - rect.y * s,
      scale: s,
    });
  };
  const centreOn = (rect: CanvasRect) => {
    const { scale } = latest.current;
    go({
      x: size.width / 2 - (rect.x + rect.width / 2) * scale,
      y: size.height / 2 - (rect.y + rect.height / 2) * scale,
      scale,
    });
  };
  useImperativeHandle(ref, () => ({
    fit,
    zoomTo: (p) => zoomAround(clampPercent(p) / 100, centre()),
    centreOn,
  }));

  // Without a starting view, fit the content once the canvas has a size.
  const fitted = useRef(view !== undefined || defaultView !== undefined);
  useClientLayoutEffect(() => {
    if (fitted.current || !size.width) return;
    fitted.current = true;
    fit();
  });

  const percent = Math.round(current.scale * 100);
  const gestures = useZoomGestures(surface, {
    percent,
    onZoom: (p, at: ZoomAnchor) => zoomAround(p / 100, at ?? centre()),
    onPan: (dx, dy) => go({ ...latest.current, x: latest.current.x + dx, y: latest.current.y + dy }),
  });
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    gestures.onKeyDown(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.key === "!" || (event.shiftKey && event.key === "1")) {
      event.preventDefault();
      fit();
      return;
    }
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
    go({ ...current, x: current.x + move[0], y: current.y + move[1] });
  };

  // Zoom changes are announced; the first value is not.
  const [said, setSaid] = useState({ percent, text: "" });
  if (said.percent !== percent) setSaid({ percent, text: text.zoom(percent) });

  // The minimap: `bounds` scaled to its width, with the view drawn on it. Dragging it (or pressing) moves the view.
  const map = useRef<HTMLDivElement>(null);
  // Measured into state (not a ref), so the view box is redrawn once the minimap's real width is known.
  const [mapWidth, setMapWidth] = useState(160);
  useClientLayoutEffect(() => {
    const w = map.current?.clientWidth;
    if (w && w !== mapWidth) setMapWidth(w);
  });
  const k = bounds ? mapWidth / bounds.width : 1;
  const seen = {
    x: (-current.x / current.scale - (bounds?.x ?? 0)) * k,
    y: (-current.y / current.scale - (bounds?.y ?? 0)) * k,
    width: (size.width / current.scale) * k,
    height: (size.height / current.scale) * k,
  };
  /** Centres the view on a point of the minimap (its own pixels). */
  const lookAt = (mx: number, my: number) => {
    if (!bounds) return;
    const { scale } = latest.current;
    go({
      x: size.width / 2 - (bounds.x + mx / k) * scale,
      y: size.height / 2 - (bounds.y + my / k) * scale,
      scale,
    });
  };
  useDrag(map, {
    onStart: ({ point }) => {
      const r = (map.current as HTMLDivElement).getBoundingClientRect();
      lookAt(point.x - r.left, point.y - r.top);
    },
    onMove: ({ point }) => {
      const r = (map.current as HTMLDivElement).getBoundingClientRect();
      lookAt(point.x - r.left, point.y - r.top);
    },
  });

  return (
    <>
      <section
        ref={surface}
        aria-label={label}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: arrows pan and Ctrl/Cmd keys zoom the canvas
        tabIndex={0}
        className={className ? `cy-pan-zoom-canvas ${className}` : "cy-pan-zoom-canvas"}
        data-panning={gestures.panning ? "" : undefined}
        style={style}
        onKeyDown={onKeyDown}
        onKeyUp={gestures.onKeyUp}
        onBlur={gestures.onBlur}
      >
        <div
          className="cy-pan-zoom-canvas-content cy-reset"
          style={{ transform: `translate(${current.x}px, ${current.y}px) scale(${current.scale})` }}
        >
          {children}
        </div>
        {minimap && bounds && (
          <div
            ref={map}
            className="cy-pan-zoom-canvas-minimap cy-reset"
            style={{ blockSize: bounds.height * k }}
            aria-hidden="true"
          >
            {renderMinimap && (
              <div
                className="cy-pan-zoom-canvas-minimap-content cy-reset"
                style={{ transform: `scale(${k}) translate(${-bounds.x}px, ${-bounds.y}px)` }}
              >
                {renderMinimap()}
              </div>
            )}
            <div
              className="cy-pan-zoom-canvas-minimap-view cy-reset"
              style={{
                insetInlineStart: seen.x,
                insetBlockStart: seen.y,
                inlineSize: seen.width,
                blockSize: seen.height,
              }}
            />
          </div>
        )}
      </section>
      <span className="cy-visually-hidden" role="status">
        {said.text}
      </span>
    </>
  );
});
