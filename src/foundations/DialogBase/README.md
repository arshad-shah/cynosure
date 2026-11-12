# DialogBase (foundation)

The only module allowed to render a native `<dialog>`. Components use `Dialog` or `Sheet`.

- `open` drives `showModal()` (or `show()` with `modal={false}`) and `close()`.
- A `cancel` event (Escape, the Android back gesture) has its default prevented and becomes `onCancel`, so the `open` prop stays in charge.
- A close the page did not ask for (an uncancelable close request) becomes `onClose`, so state can follow.
- No styling; the ref reaches the native `<dialog>`.
