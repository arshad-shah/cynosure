import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { usePopover } from "../../overlay/floating.js";
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
  /** Preferred side; flips when it does not fit. Default "top". */
  placement?: Placement;
  /** Hover delay in ms (focus opens immediately). */
  delay?: number;
  /**
   * Added to the element around the trigger (the anchor, the box the parent lays out), for layout: a grid area,
   * `flex`, margins.
   */
  className?: string | undefined;
  /**
   * Turn the tooltip off without remounting the trigger: no tip, no description, hover and focus do nothing. For a
   * tooltip that only matters sometimes, such as the full text of a label while it is cut short.
   */
  disabled?: boolean | undefined;
  /**
   * `false` when the tip only repeats text the trigger's name already holds, such as a label cut short with an
   * ellipsis: it is shown but hidden from assistive technology, and does not describe the trigger. Default true.
   */
  describe?: boolean | undefined;
}

/**
 * Tooltip in the top layer (Popover API), positioned against its trigger. Opens on hover after `delay` and on
 * keyboard focus; dismissible with Escape; hoverable; never opens on touch (WCAG 1.4.13).
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  className,
  disabled = false,
  describe = true,
}: TooltipProps) {
  const id = `cy-tip-${useId().replace(/:/g, "")}`;
  const anchor = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const trigger = () => (anchor.current?.firstElementChild as HTMLElement | null) ?? anchor.current;
  const triggerRef = useRef<HTMLElement | null>(null);
  // Focus that follows a pointer press (mouse or touch) is not keyboard focus: hover handles mouse, touch never opens.
  const pointerFocus = useRef(false);

  const off = useRef(disabled);
  off.current = disabled;
  const show = useCallback((wait: number) => {
    clearTimeout(timer.current);
    if (off.current) return;
    timer.current = setTimeout(() => setOpen(true), wait);
  }, []);
  // Disabled while open (a label stopped being cut short): close, so it does not reappear when enabled again.
  if (disabled && open) setOpen(false);
  const hide = useCallback((wait = 0) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), wait);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (disabled) {
      clearTimeout(timer.current);
      setOpen(false);
    }
  }, [disabled]);
  useClientLayoutEffect(() => {
    triggerRef.current = trigger();
  });
  usePopover(tip, open);
  // Escape closes the tooltip first when it sits inside a Popover, Menu or Dialog (shared layer stack).
  useDismiss({ open, onClose: () => setOpen(false), inside: [triggerRef, tip], outside: false });
  useAnchoredPosition(triggerRef, tip, open, placement);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated hover/focus listeners for the interactive child
    <span
      ref={anchor}
      className={className ? `cy-tooltip-anchor ${className}` : "cy-tooltip-anchor"}
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
      {disabled || !describe
        ? children
        : cloneElement(children, {
            "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
          })}
      {!disabled && (
        <span
          ref={tip}
          id={id}
          role="tooltip"
          aria-hidden={describe ? undefined : true}
          className="cy-tooltip"
          {...{ popover: "manual" }}
          onPointerEnter={() => clearTimeout(timer.current)}
          onPointerLeave={() => hide(120)}
        >
          {content}
        </span>
      )}
    </span>
  );
}
