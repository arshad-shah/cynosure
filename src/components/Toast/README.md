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

| Prop       | Default                                           | Notes                                                                               |
| ---------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `position` | `bottom-end`                                      | `top`/`bottom` × `start`/`center`/`end`; start and end follow the reading direction |
| `max`      | `3`                                               | How many show at once; older ones collapse until newer ones close                   |
| `labels`   | `{ region: "Notifications", dismiss: "Dismiss" }` | Built-in strings                                                                    |

`useToast()` returns `{ toast(options), dismiss(id?) }`. `toast()` returns the id. Options:

| Option        | Default   | Notes                                                                   |
| ------------- | --------- | ----------------------------------------------------------------------- |
| `title`       | –         | Required                                                                |
| `description` | –         | A second, quieter line                                                  |
| `tone`        | `neutral` | `neutral` · `success` · `danger` · `warning` · `info` (colour and icon) |
| `action`      | –         | `{ label, onClick }`: one button; it does not close the toast           |
| `duration`    | `5000`    | Milliseconds; `Infinity` keeps it until dismissed                       |
- Each Toaster has its own store (no globals); `useToast()` outside a Toaster throws.
- Announced once: `role="status"` (polite), `role="alert"` (assertive) for `danger`. The text is inserted once, into a live element that already exists.
- Timers pause while the pointer is over the toasts, while focus is inside them and while the page is hidden.
- On touch, a horizontal swipe of 64px dismisses; a shorter one springs back. Every close button has a 44px hit area on coarse pointers.
- No motion under reduced motion. Never writes to `<html>` or `<body>`.
- A modal Dialog opened after the Toaster sits above the toasts and makes them inert until it closes.

Tokens: `--cy-toast-width`, `--cy-toast-radius`, `--cy-toast-padding`, `--cy-toast-gap`.

## Used by

Prism (copy and export confirmations), Aperture (capture saved, upload errors), web apps (form submissions).
