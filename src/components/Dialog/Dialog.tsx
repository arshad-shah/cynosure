import { type CSSProperties, type ReactNode, useCallback, useContext, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { DialogBase } from "../../foundations/DialogBase/DialogBase.js";
import { close as closeIcon } from "../../icons/close.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { ToastHostContext } from "../../overlay/toast-host.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface DialogTokens {
  radius: string;
  padding: string;
  widthSm: string;
  widthMd: string;
  widthLg: string;
  scrim: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    dialog: DialogTokens;
  }
}

export interface DialogLabels {
  /** Accessible name of the close button. */
  close: string;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heading of the dialog; also its accessible name. */
  title: ReactNode;
  /** One or two sentences under the title; also its accessible description. */
  description?: ReactNode;
  /** Buttons along the bottom, outside the scrolling content (Cancel first, then the main action). */
  actions?: ReactNode;
  /** Width preset (the panel never grows wider than its container). */
  size?: Size;
  /** Escape, the backdrop and the close button close it (default). `false` leaves only your actions. */
  dismissible?: boolean;
  labels?: Partial<DialogLabels>;
  className?: string;
  /** Layout only, applied to the panel. Restyle through --cy-dialog-* tokens. */
  style?: CSSProperties;
  children?: ReactNode;
}

/** Internal: a Sheet is the same dialog docked to an edge. */
export interface DialogFrameProps extends DialogProps {
  side?: "bottom" | "end";
}

const DEFAULT_LABELS: DialogLabels = { close: "Close" };
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The focused element, looking inside shadow roots (document.activeElement stops at the host). */
function deepActive(): HTMLElement | null {
  if (typeof document === "undefined") return null; // server render
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active as HTMLElement | null;
}

/**
 * Where focus can actually go back to. A Dialog opened from a Menu item remembers that item, but the menu has closed
 * (hidden, still in the DOM): fall back to the button that controls the hidden popover.
 */
function reachable(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  // A closed popover can still be fading out (displayed), so ask the popover, not only the layout.
  const popover = el.closest<HTMLElement>("[popover][id]");
  const closed = popover ? !popover.matches(":popover-open") : el.checkVisibility?.() === false;
  if (!closed) return el;
  const root = el.getRootNode() as Document | ShadowRoot;
  return (popover && root.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(popover.id)}"]`)) ?? el;
}

export function DialogFrame({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  actions,
  size = "md",
  dismissible = true,
  labels,
  side,
  className,
  style,
  children,
}: DialogFrameProps) {
  const id = useId();
  const text = { ...DEFAULT_LABELS, ...labels };
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const dialog = useRef<HTMLDialogElement>(null);
  const toastHost = useContext(ToastHostContext);
  const toasts = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  // Where focus was before opening: read while rendering, because DialogBase's showModal moves it first.
  if (isOpen && !wasOpen.current) returnTo.current = deepActive();
  wasOpen.current = isOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );
  const dismiss = () => {
    if (dismissible) setOpen(false);
  };

  // On close, before useDismiss returns focus: make sure the remembered element can still take it.
  // Inside a Toaster, lend it a container while open: toasts raised now show above this dialog instead of under its
  // scrim, where the modal would make them inert. Runs after DialogBase has called showModal.
  useClientLayoutEffect(() => {
    if (!isOpen || !toastHost || !toasts.current) return;
    return toastHost.register(toasts.current);
  }, [isOpen, toastHost]);

  useClientLayoutEffect(() => {
    if (!isOpen) return;
    return () => {
      returnTo.current = reachable(returnTo.current);
    };
  }, [isOpen]);

  // DialogBase has opened it; move focus to the first control in the content, else the first action, else the
  // dialog itself (so the close button's tooltip does not pop up on open).
  useClientLayoutEffect(() => {
    if (!isOpen) return;
    const first =
      body.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      footer.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      dialog.current;
    first?.focus({ preventScroll: true });
  }, [isOpen]);

  useDismiss({
    open: isOpen,
    onClose: dismiss,
    inside: [dialog],
    returnFocus: returnTo,
    // The dialog fills its container; a pointer down on the dialog itself (not the panel) is on the backdrop.
    outside: (event) => event.composedPath()[0] === dialog.current,
  });

  return (
    <DialogBase
      ref={dialog}
      open={isOpen}
      onCancel={dismiss}
      onClose={() => setOpen(false)}
      className="cy-dialog"
      tabIndex={-1}
      data-size={size}
      data-side={side}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      <div
        className={className ? `cy-dialog-panel cy-reset ${className}` : "cy-dialog-panel cy-reset"}
        style={style}
      >
        <div className="cy-dialog-header cy-reset">
          <h2 id={`${id}-title`} className="cy-dialog-title cy-reset">
            {title}
          </h2>
          {dismissible && (
            <IconButton
              icon={closeIcon}
              label={text.close}
              variant="ghost"
              size="sm"
              tooltipPlacement="bottom"
              onClick={() => setOpen(false)}
            />
          )}
        </div>
        {description && (
          <p id={`${id}-description`} className="cy-dialog-description cy-reset">
            {description}
          </p>
        )}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated focus listener for the controls inside */}
        <div
          ref={body}
          className="cy-dialog-body cy-reset"
          // A focused field low in the content (Tab, or the on-screen keyboard opening) is brought fully into view.
          onFocus={(event) => event.target.scrollIntoView({ block: "nearest" })}
        >
          {children}
        </div>
        {actions && (
          <div ref={footer} className="cy-dialog-actions cy-reset">
            {actions}
          </div>
        )}
      </div>
      {toastHost && <div ref={toasts} className="cy-dialog-toasts" />}
    </DialogBase>
  );
}

/**
 * Modal dialog in the top layer: focus moves in, stays in and comes back; Escape, the backdrop and the close button
 * dismiss it. In a container narrower than about 36rem it becomes a bottom sheet.
 */
export function Dialog(props: DialogProps) {
  return <DialogFrame {...props} />;
}
