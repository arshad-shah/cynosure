import { type CSSProperties, type ReactNode, useContext, useEffect, useId, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { DialogBase } from "../../foundations/DialogBase/DialogBase.js";
import { deepActiveElement } from "../../foundations/focus.js";
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
  /** Whether the dialog is open, when you control it. */
  open?: boolean;
  /** Open on first render when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with `false` when the dialog closes itself: Escape, the backdrop or the close button. */
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
  /**
   * Keep the content in the DOM while the dialog is closed. By default a closed dialog renders nothing inside it: the
   * content mounts when it opens and unmounts once the closing transition has ended, so every opening starts fresh.
   * Set it for content whose state must survive closing (a half-filled form) or that is expensive to rebuild.
   * Default false.
   */
  keepMounted?: boolean;
  /** Replace the built-in English text: the close button's name. */
  labels?: Partial<DialogLabels>;
  /** Added to the panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. Restyle through --cy-dialog-* tokens. */
  style?: CSSProperties;
  /** The content; it scrolls when it is taller than the dialog. */
  children?: ReactNode;
}

/** Internal: a Sheet is the same dialog docked to an edge. */
export interface DialogFrameProps extends DialogProps {
  side?: "bottom" | "end" | "start";
  /**
   * Classes of the component built on the frame (Sheet), added to the dialog, the panel and the actions, so that
   * component draws its own look in its own stylesheet.
   */
  parts?: { root: string; panel: string; actions: string };
}

const DEFAULT_LABELS: DialogLabels = { close: "Close" };
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  keepMounted = false,
  labels,
  side,
  parts,
  className,
  style,
  children,
}: DialogFrameProps) {
  const id = useId();
  const text = { ...DEFAULT_LABELS, ...labels };
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const dialog = useRef<HTMLDialogElement>(null);
  const toastHost = useContext(ToastHostContext);
  const toasts = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  // Where focus was before opening: read while rendering, because DialogBase's showModal moves it first.
  if (isOpen && !wasOpen.current) returnTo.current = deepActiveElement();
  wasOpen.current = isOpen;
  const dismiss = () => {
    if (dismissible) setOpen(false);
  };

  // The content is rendered while open, and after closing until the closing transition has ended. `present` goes true
  // in the render that opens the dialog, so the content is there before DialogBase shows it (no empty first frame).
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);
  useEffect(() => {
    if (isOpen || !present) return;
    const el = dialog.current as HTMLDialogElement;
    const unmount = () => setPresent(false);
    // Unmount when the dialog's own closing transition ends. The timer covers a transition that never reports back
    // (interrupted, or the dialog is not rendered) and is the whole wait when there is none: reduced motion, or no
    // stylesheet.
    const style = getComputedStyle(el);
    const longest = (times: string) => Math.max(...times.split(",").map((time) => Number.parseFloat(time)));
    const wait = (longest(style.transitionDuration) + longest(style.transitionDelay)) * 1000;
    const ended = (event: Event) => {
      if (event.target === el) unmount();
    };
    el.addEventListener("transitionend", ended);
    const timer = setTimeout(unmount, wait && wait + 100);
    return () => {
      el.removeEventListener("transitionend", ended);
      clearTimeout(timer);
    };
  }, [isOpen, present]);
  const mounted = isOpen || present || keepMounted;

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
      className={parts ? `cy-dialog ${parts.root}` : "cy-dialog"}
      tabIndex={-1}
      data-size={size}
      data-side={side}
      aria-labelledby={mounted ? `${id}-title` : undefined}
      aria-describedby={mounted && description ? `${id}-description` : undefined}
    >
      {mounted && (
        <div
          className={["cy-dialog-panel cy-reset", parts?.panel, className].filter(Boolean).join(" ")}
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
                wrapperClassName="cy-dialog-close"
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
            <div
              ref={footer}
              className={parts ? `cy-dialog-actions cy-reset ${parts.actions}` : "cy-dialog-actions cy-reset"}
            >
              {actions}
            </div>
          )}
        </div>
      )}
      {toastHost && mounted && <div ref={toasts} className="cy-dialog-toasts" />}
    </DialogBase>
  );
}

/**
 * Modal dialog in the top layer: focus moves in, stays in and comes back; Escape, the backdrop and the close button
 * dismiss it. In a container narrower than about 36rem it becomes a bottom sheet. Its content is mounted only while
 * it is open (and while it closes), unless `keepMounted`.
 */
export function Dialog(props: DialogProps) {
  return <DialogFrame {...props} />;
}
