# DialogBase (foundation)

The only module allowed to render a native `<dialog>`. Components use `Dialog` or `Sheet`; only Dialog and CommandPalette build on it directly.

- `open` drives `showModal()` (or `show()` with `modal={false}`) and `close()`.
- A `cancel` event (Escape, the Android back gesture) has its default prevented and becomes `onCancel`, so the `open` prop stays in charge.
- A close the page did not ask for (an uncancelable close request) becomes `onClose`, so state can follow; if `open` is still true after it, the dialog is shown again.
- Without the dialog API (jsdom, in a product's unit tests) the `open` attribute stands in for `showModal`, `show` and `close`, so an open dialog renders instead of throwing.
- No styling; the ref reaches the native `<dialog>`.
