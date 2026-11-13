import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type RefObject,
  useImperativeHandle,
  useRef,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";

export interface RowActionsTokens {
  /** Space between the controls. */
  gap: string;
  /** Fill behind the controls, for actions drawn over the end of a row (ListRow sets it to the row's colour). */
  background: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    rowActions: RowActionsTokens;
  }
}

export interface RowActionsProps {
  /** The controls: `IconButton`s, a `Menu`, a `Toolbar` of them. */
  children?: ReactNode;
  /**
   * Whether the controls are in the Tab order. A ref to the row's own control (the one a list's roving focus moves
   * between): they are in it only while that control is the list's Tab stop, or always when the ref is empty (a row
   * that cannot be pressed). `true` or `false`: always or never. Left out: their own tabindex is left alone (a
   * `Toolbar` inside manages it).
   */
  tabbable?: boolean | RefObject<HTMLElement | null> | undefined;
  /** Shown whatever the pointer does, such as on a selected row. Default false. */
  shown?: boolean | undefined;
  /** Added to the root element, for layout (its place in the row). */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-row-actions-* tokens. */
  style?: CSSProperties | undefined;
}

/** The controls of a row, without those of a popover opened from them (a Menu's panel). */
const controlsOf = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]")].filter(
    (el) => {
      const popover = el.closest("[popover]");
      return !popover || !root.contains(popover);
    },
  );

/**
 * The buttons at the end of a row (ListRow, Tree items, ChatMessage). With a mouse they wait, in place, until their
 * row (the element that holds them, or an ancestor with `data-row-actions-host`) is hovered or holds focus, or a menu of theirs is open; where there is no hover
 * (touch) they are always shown. `tabbable` puts them in the Tab order only on the row that holds the Tab stop.
 */
export const RowActions = forwardRef<HTMLSpanElement, RowActionsProps>(function RowActions(
  { children, tabbable, shown = false, className, style },
  ref,
) {
  const root = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLSpanElement);

  // Keep the controls' tabindex in line: after every render (the row's control may have been replaced), when the
  // controls change (a Menu trigger rendered later) and, following a row control, when roving focus moves the Tab stop.
  useClientLayoutEffect(() => {
    const el = root.current;
    if (!el || tabbable === undefined) return;
    const follow = typeof tabbable === "object" ? tabbable.current : null;
    const sync = () => {
      const want =
        typeof tabbable === "object" ? (!follow || follow.tabIndex === 0 ? 0 : -1) : tabbable ? 0 : -1;
      for (const control of controlsOf(el)) if (control.tabIndex !== want) control.tabIndex = want;
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { childList: true, subtree: true });
    if (follow) observer.observe(follow, { attributes: true, attributeFilter: ["tabindex"] });
    return () => observer.disconnect();
  });

  return (
    <span
      ref={root}
      className={className ? `cy-row-actions ${className}` : "cy-row-actions"}
      data-shown={shown ? "" : undefined}
      style={style}
    >
      {children}
    </span>
  );
});
