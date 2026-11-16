import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { deepActiveElement } from "../../foundations/focus.js";
import type { VirtualAnchor } from "../../overlay/use-anchored-position.js";
import { type MenuEntry, MenuPanel } from "../Menu/Menu.js";

/** Spread onto the one element that opens the menu (a row, a card, a canvas). */
export interface ContextMenuTargetProps {
  /** Spread onto the target: focus returns to it when the menu closes. */
  ref: Ref<HTMLElement>;
  /** Spread onto the target: opens the menu on right-click, in place of the browser's own menu. */
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
  /** Spread onto the target: opens the menu on Shift+F10 or the context menu key while the target has focus. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** Spread onto the target: starts the long press that opens the menu on touch screens. */
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  /** Spread onto the target: cancels the long press when the finger moves (a scroll). */
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  /** Spread onto the target: cancels the long press when the finger lifts early. */
  onPointerUp: () => void;
  /** Spread onto the target: cancels the long press when the browser takes over the touch. */
  onPointerCancel: () => void;
  /** Spread onto the target: tells assistive tech that Shift+F10 opens the menu. */
  "aria-keyshortcuts": "Shift+F10";
}

/**
 * The props for one of many targets (`targetFor(key)`): the same handlers without the ref. The menu returns focus to
 * the element that opened it.
 */
export type ContextMenuKeyTargetProps = Omit<ContextMenuTargetProps, "ref">;

export interface ContextMenuProps<K = undefined> {
  /**
   * Render the target: `(props) => <div {...props} tabIndex={0}>…</div>`. Make it focusable for keyboard users. For
   * many targets (the rows of a list, the tabs of a tab list), spread `targetFor(key)` onto each instead, with a key
   * (any value, such as the row's item) that `label`, `items`, `onSelect` and `onOpenChange` receive back. One menu
   * then serves them all, beside the list rather than inside it.
   */
  children?:
    | ((props: ContextMenuTargetProps, targetFor: (key: K) => ContextMenuKeyTargetProps) => ReactNode)
    | undefined;
  /** Accessible name of the menu; with many targets, a function of the key of the target it opened for. */
  label: string | ((key: K) => string);
  /**
   * The commands, as in `Menu`: items, or sections of items with a group name. With many targets, a function of the
   * key of the target it opened for.
   */
  items: MenuEntry[] | ((key: K) => MenuEntry[]);
  /** Called when an item is chosen, with its `value` (and, with many targets, the key of the target). */
  onSelect: (value: string, key: K) => void;
  /**
   * Called when the menu opens or closes, e.g. to highlight the row it belongs to (with many targets, its key). With
   * `open`, it is the request: a right-click asks for `true`, Escape, a choice or an outside press for `false`.
   */
  onOpenChange?: ((open: boolean, key: K) => void) | undefined;
  /**
   * Whether the menu is open, for an app that opens it itself: a canvas finds the object under the pointer (or the
   * selected one, for Shift+F10) and opens the menu for it at `anchor`, with that object's `label` and `items`.
   * Pair with `onOpenChange`. Focus returns to what had it when the menu opened.
   */
  open?: boolean | undefined;
  /**
   * Where the menu opens when the app opens it: a point (`{ x, y }`, client coordinates, such as a pointer event's
   * `clientX` and `clientY`) or any element or virtual anchor. Without it, a menu the app opens sits under its target.
   * Used while `open` is controlled; a right-click on a target still opens at the pointer.
   */
  anchor?: { x: number; y: number } | VirtualAnchor | undefined;
  /** The browser's own menu shows instead. */
  disabled?: boolean;
  /** Added to the menu panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
}

/** How long a touch must stay down to open the menu (iOS fires no contextmenu event). */
const LONG_PRESS = 500;
/** How far a touch may drift before it counts as a scroll instead of a long press. */
const SLOP = 10;

const point = (x: number, y: number): VirtualAnchor => ({
  getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
});

/**
 * A menu of commands for one thing, opened where the person points: right-click, a long press on touch screens,
 * or Shift+F10 / the context menu key on the focused target. The menu itself behaves like `Menu`. One ContextMenu
 * can serve many targets (rows, tabs) through `targetFor`.
 */
export function ContextMenu<K = undefined>({
  children,
  label,
  items,
  onSelect,
  onOpenChange,
  open: openProp,
  anchor: anchorProp,
  disabled = false,
  className,
  style,
}: ContextMenuProps<K>) {
  const id = useId();
  const controlled = openProp !== undefined;
  const [inner, setInner] = useState(false);
  const open = controlled ? openProp : inner;
  // The target the menu is open for (or was last open for), by its key; focus returns to its element.
  const [current, setCurrent] = useState<{ key: K; keyed: boolean } | null>(null);
  const target = useRef<HTMLElement>(null);
  // Where focus goes back to: the target that opened it, or what had focus when the app opened it.
  const returnTo = useRef<HTMLElement | null>(null);
  const anchor = useRef<HTMLElement | VirtualAnchor | null>(null);
  // A target asked to open (a right-click, a long press, Shift+F10), as opposed to the app opening it.
  const asked = useRef(false);
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const latest = useRef({ disabled, onOpenChange, current, open, controlled });
  latest.current = { disabled, onOpenChange, current, open, controlled };

  const report = useCallback((next: boolean, at: { key: K; keyed: boolean } | null) => {
    const { onOpenChange } = latest.current;
    if (at?.keyed) onOpenChange?.(next, at.key);
    else (onOpenChange as ((open: boolean) => void) | undefined)?.(next);
  }, []);
  const show = useCallback(
    (key: K, keyed: boolean, el: HTMLElement, at: HTMLElement | VirtualAnchor) => {
      returnTo.current = el;
      anchor.current = at;
      asked.current = true;
      const next = { key, keyed };
      setCurrent(next);
      if (latest.current.controlled) {
        if (!latest.current.open) report(true, next);
      } else setInner(true);
    },
    [report],
  );
  const close = useCallback(() => {
    if (latest.current.controlled) {
      if (latest.current.open) report(false, latest.current.current);
    } else setInner(false);
  }, [report]);
  // Uncontrolled, the change is reported once it happens (a second right-click while open reports nothing new).
  // Only real changes: effects that run twice (StrictMode, a page shown again by Activity) report nothing.
  const reported = useRef(open);
  useEffect(() => {
    if (reported.current === open) return;
    reported.current = open;
    if (!latest.current.controlled) report(open, latest.current.current);
  }, [open, report]);

  // Opened by the app, not by a target: remember what had focus, and place it at `anchor` (else under the target).
  const wasOpen = useRef(false);
  const fromApp = useRef(false);
  if (open && !wasOpen.current) {
    fromApp.current = !asked.current;
    if (fromApp.current) {
      returnTo.current = deepActiveElement() ?? target.current;
      anchor.current = target.current;
    }
  }
  // A request the app turned down is forgotten, so its next opening counts as its own.
  if (!open) asked.current = false;
  wasOpen.current = open;
  if (open && fromApp.current && anchorProp)
    anchor.current =
      "getBoundingClientRect" in anchorProp
        ? anchorProp
        : { getBoundingClientRect: () => new DOMRect(anchorProp.x, anchorProp.y, 0, 0) };

  const cancelPress = useCallback(() => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }, []);
  useEffect(() => cancelPress, [cancelPress]);

  // Stable, so rows that are memoised do not re-render; the handlers read `disabled` when they run.
  const handlers = useCallback(
    (key: K, keyed: boolean): ContextMenuKeyTargetProps => ({
      "aria-keyshortcuts": "Shift+F10",
      onContextMenu: (event) => {
        if (latest.current.disabled) return;
        event.preventDefault();
        cancelPress();
        // A keyboard-made contextmenu event has no pointer position: place the menu at the target instead.
        const fromKeyboard = event.clientX === 0 && event.clientY === 0;
        const el = event.currentTarget;
        show(key, keyed, el, fromKeyboard ? el : point(event.clientX, event.clientY));
      },
      onKeyDown: (event) => {
        if (latest.current.disabled || event.target !== event.currentTarget) return;
        if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
          event.preventDefault();
          show(key, keyed, event.currentTarget, event.currentTarget);
        }
      },
      onPointerDown: (event) => {
        if (latest.current.disabled || event.pointerType !== "touch") return;
        const { clientX: x, clientY: y, currentTarget: el } = event;
        cancelPress();
        press.current = { x, y, timer: setTimeout(() => show(key, keyed, el, point(x, y)), LONG_PRESS) };
      },
      onPointerMove: (event) => {
        const p = press.current;
        if (p && Math.hypot(event.clientX - p.x, event.clientY - p.y) > SLOP) cancelPress();
      },
      onPointerUp: cancelPress,
      onPointerCancel: cancelPress,
    }),
    [show, cancelPress],
  );
  const targetFor = useCallback((key: K) => handlers(key, true), [handlers]);

  const key = current?.key as K;
  const choose = (value: string) => {
    if (current?.keyed) onSelect(value, key);
    else (onSelect as (value: string) => void)(value);
  };
  return (
    <>
      {children?.({ ref: target, ...handlers(undefined as K, false) }, targetFor)}
      <MenuPanel
        id={id}
        label={typeof label === "function" ? (current ? label(key) : "") : label}
        items={typeof items === "function" ? (current ? items(key) : []) : items}
        onSelect={choose}
        open={open}
        onClose={close}
        focusOn="first"
        anchor={anchor}
        placement="bottom"
        offset={2}
        inside={[]}
        returnFocus={returnTo}
        className={className}
        style={style}
      />
    </>
  );
}
