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
import { isRtl } from "../../foundations/dir.js";
import { useDrag } from "../../foundations/drag.js";
import { useHotkey } from "../../foundations/hotkey.js";
import { grip as gripIcon } from "../../icons/grip.js";
import {
  type FloatingAnchor,
  floatingOffset,
  type PopoverEl,
  useFloatingAnchor,
  useFloatingOffset,
  usePopover,
} from "../../overlay/floating.js";
import { useAnchoredPosition, type VirtualAnchor } from "../../overlay/use-anchored-position.js";
import { IconButton } from "../IconButton/IconButton.js";
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
      // Escape inside a layer nested in the bar (a Menu's panel) belongs to that layer: the dismiss stack closes it.
      const layer = (event.target as HTMLElement).closest("[popover]");
      if (layer && layer !== event.currentTarget && event.currentTarget.contains(layer)) return;
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
  /** Added to the root element, for layout. */
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
  const offset = useFloatingOffset(bar, shown);
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
      <Toolbar label={label} className="cy-floating-toolbar-row">
        {children}
      </Toolbar>
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
  /**
   * Where it docks: across the `bottom` of the visible viewport (the phone bar, default), or as a vertical palette on
   * the `start` or `end` edge (the tools of a focused editor).
   */
  edge?: DockEdge;
  /**
   * Lets people move a side palette to the other edge: shows a grip (click or tap to flip, drag to the other half to
   * snap there) and Alt+Left/Right inside the bar.
   */
  onEdgeChange?: ((edge: "start" | "end") => void) | undefined;
  /** At the bottom: a centred pill above the edge instead of a full-width bar (a mode switcher). */
  floating?: boolean;
  /** Replace the built-in English text: the grip that moves a side palette. */
  labels?: Partial<DockedToolbarLabels>;
  /** Buttons, IconButtons, SegmentedControls. */
  children?: ReactNode;
  /** Added to the bar, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-floating-toolbar-* tokens. */
  style?: CSSProperties;
}

export type DockEdge = "bottom" | "start" | "end";

export interface DockedToolbarLabels {
  /** The grip that moves a side palette. Default "Move to the other side". */
  move: string;
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
 * A toolbar docked to an edge of the visible viewport. At the bottom it is the phone form of a contextual toolbar: one
 * row that rides just above the on-screen keyboard, scrolls sideways instead of wrapping, and keeps the box being
 * worked on in view above itself. `floating` makes it a centred pill (a mode switcher). On the `start` or `end` edge it
 * is a vertical palette that people can move to the other side.
 */
export function DockedToolbar({
  label,
  open = true,
  onEscape,
  keepVisible,
  trailing,
  hotkey = "alt+f10",
  edge = "bottom",
  onEdgeChange,
  floating = false,
  labels,
  children,
  className,
  style,
}: DockedToolbarProps) {
  const text = { move: "Move to the other side", ...labels };
  const bar = useRef<PopoverEl>(null);
  const grip = useRef<HTMLButtonElement>(null);
  const side = edge !== "bottom";
  usePopover(bar, open);
  const inset = useKeyboardInset();
  useHotkey(open && hotkey, () => enter(bar.current));
  // Room at the end of the page for a bottom bar and the keyboard, so the last content can scroll above them.
  const [room, setRoom] = useState(0);
  useClientLayoutEffect(() => {
    const next = open && !side ? (bar.current as PopoverEl).offsetHeight + inset : 0;
    setRoom((r) => (r === next ? r : next));
  });
  const focus = useReturnFocus(onEscape);

  // Moving a side palette: the edge a physical side of the screen is, in this reading direction.
  const edgeAt = (left: boolean) => (left !== isRtl(bar.current as PopoverEl) ? "start" : "end");
  const flip = () => onEdgeChange?.(edge === "start" ? "end" : "start");
  const [shift, setShift] = useState<{ x: number; y: number } | null>(null);
  useDrag(grip, {
    distance: 4,
    onMove: ({ delta }) => setShift(delta),
    onEnd: ({ point, delta }, cancelled) => {
      setShift(null);
      if (cancelled) return;
      // A finger's tap starts a drag at once (and swallows the click): treat a tap as the click.
      if (Math.hypot(delta.x, delta.y) < 4) return flip();
      const to = edgeAt(point.x < window.innerWidth / 2);
      if (to !== edge) onEdgeChange?.(to);
    },
  });
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (side && onEdgeChange && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      // Alt+Left would otherwise go back in the browser's history.
      event.preventDefault();
      const to = edgeAt(event.key === "ArrowLeft");
      if (to !== edge) onEdgeChange(to);
      return;
    }
    focus.onKeyDown(event);
  };

  useEffect(() => {
    const target = keepVisible?.current;
    const el = bar.current;
    if (!open || side || !target || !el) return;
    // Measured on the next frame, once the bar and the page have their final layout.
    const frame = requestAnimationFrame(() => {
      const covered = target.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
      const gap = floatingOffset(el);
      if (covered > -gap) window.scrollBy({ top: covered + gap, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, side, inset, room, keepVisible]);

  return (
    <>
      <div className="cy-docked-toolbar-room" aria-hidden="true" style={{ blockSize: `${room}px` }} />
      {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated Escape and focus tracking for the toolbar inside */}
      <div
        ref={bar}
        className={className ? `cy-docked-toolbar ${className}` : "cy-docked-toolbar"}
        data-edge={edge}
        data-floating={floating && !side ? "" : undefined}
        data-moving={shift ? "" : undefined}
        {...{ popover: "manual" }}
        style={
          {
            "--_inset": `${inset}px`,
            ...(shift ? { "--_dx": `${shift.x}px`, "--_dy": `${shift.y}px` } : {}),
            ...style,
          } as CSSProperties
        }
        onFocus={focus.onFocus}
        onKeyDown={onKeyDown}
      >
        {side && onEdgeChange && (
          <IconButton
            ref={grip}
            icon={gripIcon}
            label={text.move}
            variant="ghost"
            size="sm"
            className="cy-docked-toolbar-grip"
            tooltipPlacement={edge === "start" ? "end" : "start"}
            onClick={flip}
          />
        )}
        <Toolbar
          label={label}
          orientation={side ? "vertical" : "horizontal"}
          className="cy-docked-toolbar-row"
        >
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
