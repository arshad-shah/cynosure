import { type DialogHTMLAttributes, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useClientLayoutEffect } from "../client-layout-effect.js";

export interface DialogBaseProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onCancel" | "onClose"> {
  /** Shown while true: `showModal()` (or `show()` when not modal) and `close()` follow this prop. */
  open: boolean;
  /** Top layer with the rest of the page inert (default), or an ordinary non-modal dialog. */
  modal?: boolean;
  /** A close request (Escape, the Android back gesture). Its default is prevented so `open` stays in charge. */
  onCancel?: () => void;
  /**
   * The browser closed the dialog while `open` was still true (a close request it would not let us cancel). If `open`
   * is still true after it, the dialog is shown again.
   */
  onClose?: () => void;
}

/**
 * Foundation: the only place Cynosure renders a native `<dialog>`. The `open` prop drives `showModal`/`close`, a
 * `cancel` event becomes `onCancel`, and a close the page did not ask for becomes `onClose`. No styling.
 */
export const DialogBase = forwardRef<HTMLDialogElement, DialogBaseProps>(function DialogBase(
  { open, modal = true, onCancel, onClose, ...rest },
  ref,
) {
  const el = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLDialogElement);
  const latest = useRef({ open, onCancel, onClose });
  latest.current = { open, onCancel, onClose };
  // Counts closes the page did not ask for, so the effect below runs again and shows a dialog `open` still wants.
  const [closed, setClosed] = useState(0);

  useClientLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    // Without the dialog API (jsdom, where products run unit tests) the `open` attribute stands in for it.
    if (open && !dialog.open) {
      if (typeof dialog.showModal !== "function") dialog.open = true;
      else modal ? dialog.showModal() : dialog.show();
    }
    if (!open && dialog.open) {
      if (typeof dialog.close !== "function") dialog.open = false;
      else dialog.close();
    }
  }, [open, modal, closed]);

  useClientLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    const cancel = (event: Event) => {
      event.preventDefault();
      latest.current.onCancel?.();
    };
    // `close` is queued as a task: a late event for a dialog that was closed and reopened since must not close it.
    const close = () => {
      if (!latest.current.open || dialog.open) return;
      latest.current.onClose?.();
      setClosed((n) => n + 1);
    };
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", close);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("close", close);
    };
  }, []);

  return <dialog ref={el} {...rest} />;
});
