import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useHotkey } from "../../foundations/hotkey.js";
import {
  type FloatingAnchor,
  type PopoverEl,
  useFloatingAnchor,
  useFloatingOffset,
  usePopover,
} from "../../overlay/floating.js";
import { useAnchoredPosition, type VirtualAnchor } from "../../overlay/use-anchored-position.js";
import { Toolbar } from "../Toolbar/Toolbar.js";

export interface FloatingToolbarTokens {
  /** Background of the bar. */
  background: string;
  /** Corner radius of the floating bar. */
  radius: string;
  /** Gap between the bar and the box it works on. */
  offset: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    floatingToolbar: FloatingToolbarTokens;
  }
}

/** What a floating toolbar sits beside. */
export type ToolbarAnchor = FloatingAnchor;

/**
 * Remembers where focus came from when it enters the bar; Escape inside the bar calls `onEscape` and returns focus
 * there, so an editor keeps its caret and selection.
 */
function useReturnFocus(onEscape: (() => void) | undefined) {
  const from = useRef<HTMLElement | null>(null);
  return {
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const prev = event.relatedTarget as HTMLElement | null;
      if (prev && !event.currentTarget.contains(prev)) from.current = prev;
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      const back = from.current;
      onEscape?.();
      if (back?.isConnected) back.focus();
    },
  };
}

/** Moves focus to the toolbar's current item (its one tab stop). */
const enter = (bar: HTMLElement | null) =>
  bar
    ?.querySelector<HTMLElement>('[role="toolbar"] [tabindex="0"], [role="toolbar"] button:not([disabled])')
    ?.focus();

export interface FloatingToolbarProps {
  /** Accessible name of the toolbar. */
  label: string;
  /** What it works on: a ref to an element, or a virtual anchor such as `useSelectionAnchor()`. */
  anchor: ToolbarAnchor;
  /** Show the bar. Default: whenever there is an anchor. */
  open?: boolean;
  /** Preferred side; it flips when there is no room. Default `top`. */
  side?: "top" | "bottom";
  /** Escape inside the bar. Focus then returns to where it came from. */
  onEscape?: (() => void) | undefined;
  /** Keyboard shortcut that moves focus into the bar while it is open. Default "alt+f10"; `false` for none. */
  hotkey?: string | false;
  /** Buttons, IconButtons, SegmentedControls. */
  children?: ReactNode;
  className?: string;
  /** Layout only. Restyle through --cy-floating-toolbar-* tokens. */
  style?: CSSProperties;
}

/**
 * A compact toolbar that floats beside the box or text it works on, like the mini toolbars of document editors. It
 * flips below when there is no room above and slides to stay on screen. Non-modal: it never takes focus by itself;
 * Alt+F10 moves into it, arrow keys move inside it (APG toolbar), Escape returns.
 */
export function FloatingToolbar({
  label,
  anchor,
  open,
  side = "top",
  onEscape,
  hotkey = "alt+f10",
  children,
  className,
  style,
}: FloatingToolbarProps) {
  const bar = useRef<PopoverEl>(null);
  const target = useFloatingAnchor(anchor);
  const shown = (open ?? true) && target.present;
  usePopover(bar, shown);
  const offset = useFloatingOffset(bar);
  useAnchoredPosition(target.ref, bar, shown, side, offset, "start");
  useHotkey(shown && hotkey, () => enter(bar.current));
  const focus = useReturnFocus(onEscape);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated Escape and focus tracking for the toolbar inside
    <div
      ref={bar}
      className={className ? `cy-floating-toolbar ${className}` : "cy-floating-toolbar"}
      {...{ popover: "manual" }}
      style={style}
      onFocus={focus.onFocus}
      onKeyDown={focus.onKeyDown}
    >
      <Toolbar label={label}>{children}</Toolbar>
    </div>
  );
}

export interface DockedToolbarProps {
  /** Accessible name of the toolbar. */
  label: string;
  /** Show the bar. Default true. */
  open?: boolean;
  /** Escape inside the bar. Focus then returns to where it came from. */
  onEscape?: (() => void) | undefined;
  /** Kept in view above the bar (and the on-screen keyboard) by scrolling the page, never covered. */
  keepVisible?: RefObject<Element | null> | undefined;
  /** Pinned after the scrolling row, always in reach (e.g. Done). */
  trailing?: ReactNode;
  /** Keyboard shortcut that moves focus into the bar while it is open. Default "alt+f10"; `false` for none. */
  hotkey?: string | false;
  children?: ReactNode;
  className?: string;
  /** Layout only. Restyle through --cy-floating-toolbar-* tokens. */
  style?: CSSProperties;
}

/** Height of the part of the layout viewport the on-screen keyboard (or browser chrome) covers at the bottom. */
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = globalThis.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return inset;
}

/**
 * The phone form of a contextual toolbar: one row docked to the bottom of the visible viewport, so it rides just above
 * the on-screen keyboard. The row never wraps; it scrolls sideways. It keeps the box being worked on in view above
 * itself by scrolling the page.
 */
export function DockedToolbar({
  label,
  open = true,
  onEscape,
  keepVisible,
  trailing,
  hotkey = "alt+f10",
  children,
  className,
  style,
}: DockedToolbarProps) {
  const bar = useRef<PopoverEl>(null);
  usePopover(bar, open);
  const inset = useKeyboardInset();
  useHotkey(open && hotkey, () => enter(bar.current));
  // Room at the end of the page for the bar and the keyboard, so the last content can scroll above them.
  const [room, setRoom] = useState(0);
  useClientLayoutEffect(() => {
    const next = open ? (bar.current as PopoverEl).offsetHeight + inset : 0;
    setRoom((r) => (r === next ? r : next));
  });
  const focus = useReturnFocus(onEscape);

  useEffect(() => {
    const target = keepVisible?.current;
    const el = bar.current;
    if (!open || !target || !el) return;
    // Measured on the next frame, once the bar and the page have their final layout.
    const frame = requestAnimationFrame(() => {
      const covered = target.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
      const gap = Number.parseFloat(getComputedStyle(el).getPropertyValue("--_offset"));
      if (covered > -gap) window.scrollBy({ top: covered + gap, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, inset, room, keepVisible]);

  return (
    <>
      <div className="cy-docked-toolbar-room" aria-hidden="true" style={{ blockSize: `${room}px` }} />
      {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated Escape and focus tracking for the toolbar inside */}
      <div
        ref={bar}
        className={className ? `cy-docked-toolbar ${className}` : "cy-docked-toolbar"}
        {...{ popover: "manual" }}
        style={{ "--_inset": `${inset}px`, ...style } as CSSProperties}
        onFocus={focus.onFocus}
        onKeyDown={focus.onKeyDown}
      >
        <Toolbar label={label} className="cy-docked-toolbar-row">
          {children}
        </Toolbar>
        {trailing != null && <div className="cy-docked-toolbar-trailing cy-reset">{trailing}</div>}
      </div>
    </>
  );
}

/**
 * The current text selection inside `container`, as an anchor for a FloatingToolbar (a formatting bubble). `null`
 * when nothing is selected there. Follows the selection as it changes.
 */
export function useSelectionAnchor(container: RefObject<HTMLElement | null>): VirtualAnchor | null {
  const [anchor, setAnchor] = useState<VirtualAnchor | null>(null);
  useEffect(() => {
    const update = () => {
      const selection = document.getSelection();
      const root = container.current;
      if (!selection || selection.isCollapsed || selection.rangeCount === 0 || !root) return setAnchor(null);
      const range = selection.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return setAnchor(null);
      setAnchor({ getBoundingClientRect: () => range.getBoundingClientRect() });
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [container]);
  return anchor;
}
