import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { anchoredScroll, type ZoomSetting, zoomScale } from "../../foundations/zoom.js";
import { useZoomGestures, type ZoomAnchor } from "../../foundations/zoom-gestures.js";

export type { ZoomSetting };

export interface DocumentViewportTokens {
  /** Behind the pages. */
  background: string;
  /** Space between and around pages. */
  gap: string;
  /** A page's shadow. */
  pageShadow: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    documentViewport: DocumentViewportTokens;
  }
}

export interface ViewportPage {
  id: string;
  /** Size at 100%, in CSS pixels (a PDF point is one). */
  width: number;
  height: number;
}

export interface PageRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RenderPageProps {
  /** The page's `id` from `pages`. */
  id: string;
  /** Position of the page in `pages`, from 0. */
  index: number;
  /** 1 = 100%. Draw at `width` by `height` times `scale`. */
  scale: number;
  /** In view now (pages just outside are rendered too, so scrolling is seamless). */
  visible: boolean;
  /** The part of the page in view, in its own scaled pixels; null when none is. Render only that, for huge pages. */
  visibleRect: PageRect | null;
}

/** Scroll to a page, or to a rect on it (centred), at 100% units. A new `nonce` scrolls again. */
export interface ScrollRequest {
  id: string;
  nonce: number;
  rect?: PageRect;
  /** Move focus to the page afterwards (go-to-page). */
  focus?: boolean;
}

export interface DocumentViewportLabels {
  /** A page's name. Default "Page 3 of 12". */
  page: (number: number, total: number) => string;
  /** Announced when the zoom changes. Default "Zoom 125%". */
  zoom: (percent: number) => string;
}

export interface DocumentViewportProps {
  /** Names the viewport ("Document", "Contract.pdf"). */
  label: string;
  /** The pages, top to bottom, each with its size at 100%. */
  pages: readonly ViewportPage[];
  /** The zoom setting, when you control it: fit width, fit page or a percent. */
  zoom?: ZoomSetting | undefined;
  /** Default fit-width. */
  defaultZoom?: ZoomSetting;
  /** Gestures and keys ask for a percent. */
  onZoomChange?: ((zoom: ZoomSetting) => void) | undefined;
  /** Draws one page. Called for each page in or near the view. */
  renderPage: (page: RenderPageProps) => ReactNode;
  /** The pages in view, top to bottom. */
  onVisiblePagesChange?: ((ids: string[]) => void) | undefined;
  /** The page with the most of itself in view. */
  onCurrentPageChange?: ((id: string | null) => void) | undefined;
  /** The scale the zoom came to (fit modes depend on the viewport). */
  onScaleChange?: ((scale: number) => void) | undefined;
  /** Scrolls to a page, or to a rect on it. A new `nonce` scrolls again. */
  scrollTo?: ScrollRequest | undefined;
  /** Replace the built-in English text: page names and the zoom announcement. */
  labels?: Partial<DocumentViewportLabels>;
  /** Added to the scrolling root element, for layout. */
  className?: string;
  /** Layout only (give it a height). Restyle through --cy-document-viewport-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: DocumentViewportLabels = {
  page: (n, total) => `Page ${n} of ${total}`,
  zoom: (percent) => `Zoom ${percent}%`,
};

/** Calls the latest `callback` with `value` whenever `value` (compared by `key`) changes. */
function useReport<T>(value: T, key: string, callback: ((v: T) => void) | undefined) {
  const latest = useRef(callback);
  latest.current = callback;
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    latest.current?.(value);
  });
}

/**
 * A scrolling, zoomable document: pages one under another, only those near the view rendered, zoomed by setting
 * (fit width, fit page, a percent), Ctrl/Cmd+wheel or a pinch around the pointer, panned with Space+drag. It reports
 * the pages in view and the current page, scrolls to a page or a spot on it on request, and announces zoom changes.
 */
export function DocumentViewport({
  label,
  pages,
  zoom,
  defaultZoom = { kind: "fit-width" },
  onZoomChange,
  renderPage,
  onVisiblePagesChange,
  onCurrentPageChange,
  onScaleChange,
  scrollTo,
  labels,
  className,
  style,
}: DocumentViewportProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const scroller = useRef<HTMLElement>(null);
  const [setting, setSetting] = useControllableState(zoom, defaultZoom, onZoomChange);
  // The gap comes from the token, in pixels, for the layout maths.
  const [gap, setGap] = useState(16);
  useClientLayoutEffect(() => {
    const g = Number.parseFloat(getComputedStyle(scroller.current as HTMLElement).getPropertyValue("--_gap"));
    if (g !== gap) setGap(g);
  });

  // The viewport's size feeds the fit modes; the windowing measures it.
  const sizesAt = (scale: number) => pages.map((p) => p.height * scale);
  const [scale, setScale] = useState(1);
  const win = useVirtualWindow(scroller, { count: pages.length, sizes: sizesAt(scale), gap, overscan: 1 });
  const next = zoomScale(setting, pages, win.view, gap);
  if (next !== scale) setScale(next);
  const percent = Math.round(scale * 100);

  const [scrollLeft, setScrollLeft] = useState(0);
  const widest = Math.max(0, ...pages.map((p) => p.width * scale));
  const contentWidth = Math.max(win.view.width, widest + 2 * gap);

  // Zooming keeps the point under the pointer (or the viewport's centre) where it is.
  const anchor = useRef<{ at: { x: number; y: number }; from: number } | null>(null);
  const gestures = useZoomGestures(scroller, {
    percent,
    onZoom: (value, at: ZoomAnchor) => {
      anchor.current = { at: at ?? { x: win.view.width / 2, y: win.view.height / 2 }, from: scale };
      setSetting({ kind: "percent", value });
    },
  });
  const lastScale = useRef(scale);
  useClientLayoutEffect(() => {
    const el = scroller.current as HTMLElement;
    if (lastScale.current === scale) return;
    const a = anchor.current ?? {
      at: { x: el.clientWidth / 2, y: el.clientHeight / 2 },
      from: lastScale.current,
    };
    anchor.current = null;
    lastScale.current = scale;
    const to = anchoredScroll({ left: el.scrollLeft, top: el.scrollTop }, a.at, scale / a.from);
    el.scrollLeft = to.left;
    el.scrollTop = to.top;
    win.onScroll(el.scrollTop);
    setScrollLeft(el.scrollLeft);
  });

  // In view: which pages, and how much of each.
  const { top, height } = win.view;
  const view = { left: scrollLeft, right: scrollLeft + win.view.width, top, bottom: top + height };
  const placed = win.indices.map((i) => {
    const page = pages[i] as ViewportPage;
    const w = page.width * scale;
    const h = page.height * scale;
    const x = (contentWidth - w) / 2;
    const y = win.offsetOf(i);
    const l = Math.max(0, view.left - x);
    const t = Math.max(0, view.top - y);
    const r = Math.min(w, view.right - x);
    const b = Math.min(h, view.bottom - y);
    const rect = height > 0 && r > l && b > t ? { left: l, top: t, width: r - l, height: b - t } : null;
    return { page, i, w, h, x, y, rect, area: rect ? rect.width * rect.height : 0 };
  });
  const inView = placed.filter((p) => p.rect).sort((a, b) => a.i - b.i);
  const current = inView.reduce<(typeof placed)[number] | null>(
    (best, p) => (!best || p.area > best.area ? p : best),
    null,
  );
  useReport(
    inView.map((p) => p.page.id),
    inView.map((p) => p.page.id).join(" "),
    onVisiblePagesChange,
  );
  useReport(current?.page.id ?? null, current?.page.id ?? "", onCurrentPageChange);
  useReport(scale, String(scale), onScaleChange);

  // Scroll requests: only a new nonce scrolls; focus waits for the page to be rendered there.
  const lastNonce = useRef<number | null>(null);
  const pendingFocus = useRef<string | null>(null);
  useClientLayoutEffect(() => {
    const el = scroller.current as HTMLElement;
    if (!scrollTo || scrollTo.nonce === lastNonce.current) return;
    const i = pages.findIndex((p) => p.id === scrollTo.id);
    if (i < 0) return;
    lastNonce.current = scrollTo.nonce;
    const page = pages[i] as ViewportPage;
    const { rect } = scrollTo;
    if (rect) {
      el.scrollTop = win.offsetOf(i) + rect.top * scale - (el.clientHeight - rect.height * scale) / 2;
      el.scrollLeft =
        (contentWidth - page.width * scale) / 2 +
        rect.left * scale -
        (el.clientWidth - rect.width * scale) / 2;
    } else el.scrollTop = win.offsetOf(i) - gap;
    win.onScroll(el.scrollTop);
    setScrollLeft(el.scrollLeft);
    pendingFocus.current = scrollTo.focus ? scrollTo.id : null;
  });
  useClientLayoutEffect(() => {
    const id = pendingFocus.current;
    const slot = id && scroller.current?.querySelector<HTMLElement>(`[data-page="${CSS.escape(id)}"]`);
    if (!slot) return;
    pendingFocus.current = null;
    slot.focus({ preventScroll: true });
  });

  // Zoom changes are announced; the first value is not.
  const [said, setSaid] = useState({ percent, text: "" });
  if (said.percent !== percent) setSaid({ percent, text: text.zoom(percent) });

  return (
    <>
      <section
        ref={scroller}
        aria-label={label}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the document scrolls and zooms from the keyboard, so it is a tab stop
        tabIndex={0}
        className={className ? `cy-document-viewport ${className}` : "cy-document-viewport"}
        data-panning={gestures.panning ? "" : undefined}
        style={style}
        onKeyDown={gestures.onKeyDown}
        onKeyUp={gestures.onKeyUp}
        onBlur={gestures.onBlur}
        onScroll={(e) => {
          win.onScroll(e.currentTarget.scrollTop);
          setScrollLeft(e.currentTarget.scrollLeft);
        }}
      >
        <div
          className="cy-document-viewport-content cy-reset"
          style={{ inlineSize: contentWidth, blockSize: win.total }}
        >
          {placed.map(({ page, i, w, h, x, y, rect }) => (
            // biome-ignore lint/a11y/useSemanticElements: a page is a named group of whatever it shows, not a form fieldset
            <div
              key={page.id}
              role="group"
              aria-label={text.page(i + 1, pages.length)}
              data-page={page.id}
              // Reached by go-to-page (focus), not in the Tab order.
              tabIndex={-1}
              className="cy-document-viewport-page cy-reset"
              style={{ insetInlineStart: x, insetBlockStart: y, inlineSize: w, blockSize: h }}
            >
              {renderPage({ id: page.id, index: i, scale, visible: rect !== null, visibleRect: rect })}
            </div>
          ))}
        </div>
      </section>
      <span className="cy-visually-hidden" role="status">
        {said.text}
      </span>
    </>
  );
}
