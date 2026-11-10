import { type DialogHTMLAttributes, forwardRef, useImperativeHandle, useRef } from "react";
import { useClientLayoutEffect } from "../client-layout-effect.js";

export interface DialogBaseProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onCancel" | "onClose"> {
  /** Shown while true: `showModal()` (or `show()` when not modal) and `close()` follow this prop. */
  open: boolean;
  /** Top layer with the rest of the page inert (default), or an ordinary non-modal dialog. */
  modal?: boolean;
  /** A close request (Escape, the Android back gesture). Its default is prevented so `open` stays in charge. */
  onCancel?: () => void;
  /** The browser closed the dialog while `open` was still true (a close request it would not let us cancel). */
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

  useClientLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    if (open && !dialog.open) modal ? dialog.showModal() : dialog.show();
    if (!open && dialog.open) dialog.close();
  }, [open, modal]);

  useClientLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    const cancel = (event: Event) => {
      event.preventDefault();
      latest.current.onCancel?.();
    };
    // `close` is queued as a task: a late event for a dialog that was closed and reopened since must not close it.
    const close = () => {
      if (latest.current.open && !dialog.open) latest.current.onClose?.();
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
