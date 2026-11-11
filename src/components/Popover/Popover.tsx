import { type CSSProperties, type KeyboardEvent, type ReactNode, type Ref, useId, useRef } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { usePopover } from "../../overlay/floating.js";
import type { Placement } from "../../overlay/position.js";
import { useAnchoredPosition, type VirtualAnchor } from "../../overlay/use-anchored-position.js";
import type { Size } from "../../tokens/schema.js";

export interface PopoverTokens {
  padding: string;
  radius: string;
  widthSm: string;
  widthMd: string;
  widthLg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    popover: PopoverTokens;
  }
}

/** Spread onto the trigger (a Button or IconButton). */
export interface PopoverTriggerProps {
  /** Spread onto the trigger: the panel is placed against it and focus returns to it on close. */
  ref: Ref<HTMLButtonElement>;
  /** Spread onto the trigger: opens the panel, or closes it when open. */
  onClick: () => void;
  /** Spread onto the trigger: whether the panel is open. */
  "aria-expanded": boolean;
  /** Spread onto the trigger: the id of the panel. */
  "aria-controls": string;
  /** Spread onto the trigger: tells assistive technology it opens a dialog. */
  "aria-haspopup": "dialog";
}

export interface PopoverProps {
  /**
   * Render the trigger: `(props) => <Button {...props}>Filters</Button>`. Optional with `anchor`: a popover opened
   * at a point (a canvas click) has no trigger, and is controlled with `open`.
   */
  trigger?: ((props: PopoverTriggerProps) => ReactNode) | undefined;
  /**
   * Place it at a point (`{ x, y }` in viewport pixels, such as where a canvas was clicked) or beside any element or
   * virtual anchor, instead of the trigger. Focus goes back to where it was when it closes.
   */
  anchor?: { x: number; y: number } | VirtualAnchor | undefined;
  /** Accessible name of the panel (a non-modal dialog). */
  label: string;
  /** Controlled open state. */
  open?: boolean;
  /** Open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new state when the trigger, Escape or an outside click opens or closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when it does not fit. `start`/`end` follow the reading direction. */
  placement?: Placement;
  /** Panel width preset. */
  size?: Size;
  /** Keep Tab inside the panel until it closes. */
  modal?: boolean;
  /** Added to the panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
  /** The panel's content. Focus moves to its first focusable element on open. */
  children?: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Floating panel in the top layer, anchored to its trigger. Escape, outside clicks and focus return are shared. */
export function Popover({
  trigger,
  anchor,
  label,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  size = "md",
  modal = false,
  className,
  style,
  children,
}: PopoverProps) {
  const id = useId();
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // An `anchor` replaces the trigger as what the panel is placed against.
  const placed = useRef<HTMLElement | VirtualAnchor | null>(null);
  placed.current = !anchor
    ? triggerRef.current
    : "getBoundingClientRect" in anchor
      ? anchor
      : { getBoundingClientRect: () => new DOMRect(anchor.x, anchor.y, 0, 0) };
  // Without a trigger, focus returns to whatever had it when the panel opened.
  const before = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (isOpen && !wasOpen.current && typeof document !== "undefined")
    before.current = document.activeElement as HTMLElement | null;
  wasOpen.current = isOpen;
  const returnTo = useRef<HTMLElement | null>(null);
  returnTo.current = trigger ? triggerRef.current : before.current;

  // Show before positioning (the panel must be laid out to be measured), then move focus inside.
  usePopover(panel, isOpen, (el) => {
    const first = el.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? el).focus({ preventScroll: true });
  });
  useAnchoredPosition(anchor ? placed : triggerRef, panel, isOpen, placement, 6, "start");
  useDismiss({
    open: isOpen,
    onClose: () => setOpen(false),
    inside: [triggerRef, panel],
    returnFocus: returnTo,
  });

  const trap = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!modal || event.key !== "Tab") return;
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    const active = event.currentTarget.ownerDocument.activeElement;
    if (event.shiftKey && (active === first || active === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {trigger?.({
        ref: triggerRef,
        onClick: () => setOpen(!isOpen),
        "aria-expanded": isOpen,
        "aria-controls": `${id}-panel`,
        "aria-haspopup": "dialog",
      })}
      <div
        ref={panel}
        id={`${id}-panel`}
        role="dialog"
        aria-label={label}
        aria-modal={modal || undefined}
        tabIndex={-1}
        {...{ popover: "manual" }}
        className={className ? `cy-popover ${className}` : "cy-popover"}
        data-size={size}
        style={style}
        onKeyDown={trap}
      >
        {children}
      </div>
    </>
  );
}
