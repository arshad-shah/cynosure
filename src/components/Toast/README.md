# Toast

Short, temporary messages about something that just happened ("Saved", "Upload failed"), stacked along one edge of the screen in the top layer.

```tsx
<Toaster position="bottom-end" max={3}>
  <App />
</Toaster>;

function SaveButton() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: "Saved", tone: "success" })}>Save</Button>;
}
```

`<Toaster>`:

| Prop       | Default                                           | Notes                                                                                                                |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `position` | `bottom-end`                                      | `top`/`bottom` × `start`/`center`/`end`; start and end follow the reading direction                                  |
| `max`      | `3`                                               | How many show at once; older ones collapse until newer ones close                                                    |
| `offset`   | –                                                 | Extra distance from the edge the toasts sit on: a space step (`"8"`), a CSS length (`"72px"`) or `{ block, inline }` |
| `labels`   | `{ region: "Notifications", dismiss: "Dismiss" }` | Built-in strings                                                                                                     |

`useToast()` returns `{ toast(options), dismiss(id?) }`. `toast()` returns the id. Options:

| Option        | Default   | Notes                                                                   |
| ------------- | --------- | ----------------------------------------------------------------------- |
| `title`       | –         | Required                                                                |
| `description` | –         | A second, quieter line                                                  |
| `tone`        | `neutral` | `neutral` · `success` · `danger` · `warning` · `info` (colour and icon) |
| `action`      | –         | `{ label, onClick }`: one button; it does not close the toast           |
| `duration`    | `5000`    | Milliseconds; `Infinity` keeps it until dismissed                       |
- **Keeping clear of fixed UI.** The toasts sit one `--cy-space-6` in from the edges, plus the device's safe area (`env(safe-area-inset-*)`). `offset` adds to that on the edge they sit on, so they stay above a bottom tab bar: `<Toaster offset="56px">`. One value is the distance from the top or bottom edge (whichever `position` names); `{ block, inline }` also sets the distance from the side (`start` or `end`, following the reading direction; both sides for `center`). The same two distances are tokens, for setting them from CSS, for example only on phones. The prop wins over the tokens.

  ```css
  @media (max-width: 48rem) {
    .app {
      --cy-toast-offset-block: 56px; /* the tab bar's height */
    }
  }
  ```

  The region stays transparent to the pointer, so the bar under it still takes presses.
- Each Toaster has its own store (no globals); `useToast()` outside a Toaster throws.
- Announced once: `role="status"` (polite), `role="alert"` (assertive) for `danger`. The text is inserted once, into a live element that already exists.
- Timers pause while the pointer is over the toasts, while focus is inside them and while the page is hidden.
- On touch, a horizontal swipe of 64px dismisses; a shorter one springs back. Every close button has a 44px hit area on coarse pointers.
- No motion under reduced motion. Never writes to `<html>` or `<body>`.
- Inside an open Dialog or Sheet (within the Toaster), toasts show in the dialog, above its backdrop, instead of under it where the modal would make them inert. When it closes they move back to the page with their remaining time, and are not announced again.

Tokens: `--cy-toast-width`, `--cy-toast-radius`, `--cy-toast-padding`, `--cy-toast-gap`, `--cy-toast-offset-block` (extra distance from the top or bottom edge the toasts sit on), `--cy-toast-offset-inline` (extra distance from the side they sit on).
