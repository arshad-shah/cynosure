import { type CSSProperties, type KeyboardEvent, type ReactNode, type Ref, useId, useRef } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { usePopover } from "../../overlay/floating.js";
import type { Placement } from "../../overlay/position.js";
import { useAnchoredPosition } from "../../overlay/use-anchored-position.js";
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
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "dialog";
}

export interface PopoverProps {
  /** Render the trigger: `(props) => <Button {...props}>Filters</Button>`. */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  /** Accessible name of the panel (a non-modal dialog). */
  label: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when it does not fit. `start`/`end` follow the reading direction. */
  placement?: Placement;
  /** Panel width preset. */
  size?: Size;
  /** Keep Tab inside the panel until it closes. */
  modal?: boolean;
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
  children?: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Floating panel in the top layer, anchored to its trigger. Escape, outside clicks and focus return are shared. */
export function Popover({
  trigger,
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

  // Show before positioning (the panel must be laid out to be measured), then move focus inside.
  usePopover(panel, isOpen, (el) => {
    const first = el.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? el).focus({ preventScroll: true });
  });
  useAnchoredPosition(triggerRef, panel, isOpen, placement, 6, "start");
  useDismiss({
    open: isOpen,
    onClose: () => setOpen(false),
    inside: [triggerRef, panel],
    returnFocus: triggerRef,
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
      {trigger({
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
