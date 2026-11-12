import { type RefObject, useRef } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

/** How close to the end, in CSS pixels, still counts as at the end (zoom and fractional pixels). */
const SLACK = 2;

export interface FollowOptions {
  /** Keep the end in view as the content grows, while the view is at the end. */
  follow: boolean;
  /** Called with true when the view reaches the end and false when it leaves it. It starts true. */
  onAtBottomChange?: ((atBottom: boolean) => void) | undefined;
  /**
   * An element whose size is the content's (a wrapper round it, a spacer): it is watched, and when it grows the view
   * follows. Without it, call `contentChanged` after the content changes (a list that knows its own height).
   */
  content?: RefObject<HTMLElement | null>;
  /** Called after the scroller or the `content` element changed size, once following has caught up. */
  onResize?: (() => void) | undefined;
}

export interface Follow {
  /** Pass the scroller's scroll events. */
  onScroll: () => void;
  /** Call after the content changed size when there is no `content` element to watch. */
  contentChanged: () => void;
  /** Scrolls to the end, which also resumes following. */
  scrollToEnd: () => void;
}

/**
 * Following the end of a scroller (a log, a chat, a live feed), for ScrollArea and VirtualList. While the view is at
 * the end, growing content (or a shrinking view) keeps it there; scrolling up releases it and scrolling back to the
 * end resumes it. Only a move up releases: a scroll event that lands after content grew but before the view caught
 * up does not, so a fast stream never drops out of following on its own. `onAtBottomChange` reports each change.
 */
export function useFollow(scroller: RefObject<HTMLElement | null>, options: FollowOptions): Follow {
  const latest = useRef(options);
  latest.current = options;
  const state = useRef({ atEnd: true, top: 0 });

  const set = (atEnd: boolean) => {
    if (state.current.atEnd === atEnd) return;
    state.current.atEnd = atEnd;
    latest.current.onAtBottomChange?.(atEnd);
  };
  const distance = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight;
  const scrollToEnd = () => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    state.current.top = el.scrollTop;
    set(true);
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const top = el.scrollTop;
    if (distance(el) <= SLACK) set(true);
    else if (top < state.current.top) set(false);
    state.current.top = top;
  };
  const contentChanged = () => {
    const el = scroller.current;
    if (!el) return;
    if (latest.current.follow && state.current.atEnd) scrollToEnd();
    else set(distance(el) <= SLACK);
  };

  // The scroller (a view that shrinks) and the content element when there is one; re-observed when either changes.
  const watched = useRef<{ observer: ResizeObserver; els: (Element | null)[] } | null>(null);
  useClientLayoutEffect(() => {
    const els = [scroller.current, options.content?.current ?? null];
    const w = watched.current;
    if (w?.els.every((el, i) => el === els[i])) return;
    w?.observer.disconnect();
    const observer = new ResizeObserver(() => {
      contentChanged();
      latest.current.onResize?.();
    });
    for (const el of els) if (el) observer.observe(el);
    watched.current = { observer, els };
  });
  useClientLayoutEffect(
    () => () => {
      watched.current?.observer.disconnect();
      watched.current = null;
    },
    [],
  );
  // Turning follow on while at the end goes to the end.
  useClientLayoutEffect(() => {
    if (options.follow && state.current.atEnd) scrollToEnd();
  }, [options.follow]);

  return { onScroll, contentChanged, scrollToEnd };
}
