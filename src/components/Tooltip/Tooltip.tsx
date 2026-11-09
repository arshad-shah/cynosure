import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDismiss } from "../../overlay/dismiss.js";
import type { Placement } from "../../overlay/position.js";
import { useAnchoredPosition } from "../../overlay/use-anchored-position.js";

export interface TooltipTokens {
  bg: string;
  ink: string;
  radius: string;
  maxWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    tooltip: TooltipTokens;
  }
}

export interface TooltipProps {
  /** Short supplementary text; it becomes the trigger's accessible description. */
  content: ReactNode;
  /** One focusable element (Button, IconButton, Link…). */
  children: ReactElement<Record<string, unknown>>;
  placement?: Placement;
  /** Hover delay in ms (focus opens immediately). */
  delay?: number;
}

/**
 * Tooltip in the top layer (Popover API), positioned against its trigger. Opens on hover after `delay` and on
 * keyboard focus; dismissible with Escape; hoverable; never opens on touch (WCAG 1.4.13).
 */
export function Tooltip({ content, children, placement = "top", delay = 300 }: TooltipProps) {
  const id = `cy-tip-${useId().replace(/:/g, "")}`;
  const anchor = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const trigger = () => (anchor.current?.firstElementChild as HTMLElement | null) ?? anchor.current;
  const triggerRef = useRef<HTMLElement | null>(null);
  // Focus that follows a pointer press (mouse or touch) is not keyboard focus: hover handles mouse, touch never opens.
  const pointerFocus = useRef(false);

  const show = useCallback((wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), wait);
  }, []);
  const hide = useCallback((wait = 0) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), wait);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    triggerRef.current = trigger();
    const el = tip.current as (HTMLElement & { showPopover?: () => void; hidePopover?: () => void }) | null;
    if (!el?.showPopover) return;
    if (open && !el.matches(":popover-open")) el.showPopover();
    if (!open && el.matches(":popover-open")) el.hidePopover?.();
  });
  // Escape closes the tooltip first when it sits inside a Popover, Menu or Dialog (shared layer stack).
  useDismiss({ open, onClose: () => setOpen(false), inside: [triggerRef, tip], outside: false });
  useAnchoredPosition(triggerRef, tip, open, placement);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated hover/focus listeners for the interactive child
    <span
      ref={anchor}
      className="cy-tooltip-anchor"
      onPointerEnter={(e) => e.pointerType !== "touch" && show(delay)}
      onPointerLeave={() => hide(120)}
      onPointerDown={() => {
        pointerFocus.current = true;
        hide();
      }}
      onFocus={(e) => {
        if (!pointerFocus.current && (e.target as HTMLElement).matches(":focus-visible")) show(0);
        pointerFocus.current = false;
      }}
      onBlur={() => {
        pointerFocus.current = false;
        hide();
      }}
    >
      {cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
      })}
      <span
        ref={tip}
        id={id}
        role="tooltip"
        className="cy-tooltip"
        {...{ popover: "manual" }}
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={() => hide(120)}
      >
        {content}
      </span>
    </span>
  );
}
