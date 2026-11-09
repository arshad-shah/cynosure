import { type DialogHTMLAttributes, forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

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

  useLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    if (open && !dialog.open) modal ? dialog.showModal() : dialog.show();
    if (!open && dialog.open) dialog.close();
  }, [open, modal]);

  useLayoutEffect(() => {
    const dialog = el.current as HTMLDialogElement;
    const cancel = (event: Event) => {
      event.preventDefault();
      latest.current.onCancel?.();
    };
    const close = () => {
      if (latest.current.open) latest.current.onClose?.();
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
