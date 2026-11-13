import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type Ref,
  type UIEvent,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { alignedScroll, type ScrollAlign } from "../../foundations/scroll-align.js";
import { useFollow } from "../../foundations/use-follow.js";
import { OverlayFrame } from "../OverlayFrame/OverlayFrame.js";

/** Where `scrollIntoView` puts the element. */
export interface ScrollAreaIntoViewOptions {
  /** `nearest` (default) scrolls the least that shows it whole; `start` puts it at the top; `center` in the middle. */
  align?: ScrollAlign;
}

/** What `handle` gives you: scrolling from outside the area (a "jump to latest" button, a search hit). */
export interface ScrollAreaHandle {
  /** Scrolls to the end (the bottom), which also resumes `follow`. */
  scrollToEnd: () => void;
  /** Scrolls the area, and nothing around it, so `element` (inside the area) is in view. */
  scrollIntoView: (element: Element, options?: ScrollAreaIntoViewOptions) => void;
}

export interface ScrollAreaProps {
  /**
   * Accessible name. With it the area is a named region, and a tab stop whenever there is something to scroll, so
   * a keyboard can scroll it. Give one unless the content has its own focusable elements (links, buttons, a list).
   */
  label?: string | undefined;
  /** Which way it scrolls; content is clipped the other way. Default "vertical". */
  direction?: "vertical" | "horizontal" | "both";
  /**
   * Keep the end in view while content is added (a log, a chat, an activity stream). Scrolling up lets go; scrolling
   * back to the end, or `handle.scrollToEnd()`, follows again.
   */
  follow?: boolean;
  /** Called on every scroll of the area, with the scroll event of its scrolling element. */
  onScroll?: ((event: UIEvent<HTMLDivElement>) => void) | undefined;
  /**
   * Called with false when the view leaves the end (the bottom) and true when it is back, from scrolling or from
   * content growing past it. It starts true. Use it to show a "jump to latest" control.
   */
  onAtBottomChange?: ((atBottom: boolean) => void) | undefined;
  /**
   * Content pinned over the area at the bottom centre that does not scroll: a "3 new" pill, a "jump to latest" button.
   * It is outside the named region.
   */
  overlay?: ReactNode;
  /** `scrollToEnd` and `scrollIntoView`, for scrolling from outside. */
  handle?: Ref<ScrollAreaHandle>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (e.g. `maxBlockSize`). Restyle through --cy-scroll-area-* tokens. */
  style?: CSSProperties;
  /** What scrolls. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/**
 * A box that fills its parent and scrolls what does not fit: the scrolling middle of an app shell, a panel, a log.
 * It can follow the end as content arrives and hold an overlay that stays put.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    label,
    direction = "vertical",
    follow = false,
    onScroll,
    onAtBottomChange,
    overlay,
    handle,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  const following = useFollow(viewport, {
    follow,
    onAtBottomChange,
    content,
    onResize: () => {
      const el = viewport.current;
      if (!el) return;
      const y = direction !== "horizontal" && el.scrollHeight > el.clientHeight;
      const x = direction !== "vertical" && el.scrollWidth > el.clientWidth;
      setScrolls(x || y);
    },
  });

  useImperativeHandle(handle, () => ({
    scrollToEnd: following.scrollToEnd,
    // The handle is set while the area is mounted, so its viewport is there.
    scrollIntoView: (element, { align = "nearest" } = {}) => {
      const el = viewport.current as HTMLDivElement;
      const view = el.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      // Where the element is in the visible area (the view at 0), so the distance works in either text direction.
      const along = (offset: number, size: number, room: number) =>
        alignedScroll(0, room, offset, size, align);
      if (direction !== "horizontal")
        el.scrollTop += along(box.top - view.top - el.clientTop, box.height, el.clientHeight);
      if (direction !== "vertical")
        el.scrollLeft += along(box.left - view.left - el.clientLeft, box.width, el.clientWidth);
    },
  }));

  return (
    <OverlayFrame
      ref={ref}
      {...rest}
      className={className ? `cy-scroll-area ${className}` : "cy-scroll-area"}
      style={style}
      overlay={overlay}
    >
      <div
        ref={viewport}
        className="cy-scroll-area-viewport cy-reset"
        data-direction={direction}
        // A named region, and a tab stop while there is something to scroll, so a keyboard can scroll it.
        {...(label ? { role: "region", "aria-label": label, tabIndex: scrolls ? 0 : undefined } : {})}
        onScroll={(event) => {
          following.onScroll();
          onScroll?.(event);
        }}
      >
        <div ref={content} className="cy-scroll-area-content cy-reset">
          {children}
        </div>
      </div>
    </OverlayFrame>
  );
});
