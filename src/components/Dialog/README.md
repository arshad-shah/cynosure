# Dialog

A modal dialog in the browser top layer, built on the `DialogBase` foundation (native `<dialog>` with `showModal`). In a narrow container it becomes a bottom sheet.

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Edit profile"
  description="Changes are saved to your account."
  actions={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="solid" tone="accent" onClick={save}>
        Save
      </Button>
    </>
  }
>
  <TextField label="Name" />
</Dialog>;
```

| Prop                                    | Default              | Notes                                                                                                                                  |
| --------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen` / `onOpenChange` | `false`              | Controlled or uncontrolled                                                                                                             |
| `title`                                 | –                    | `h2` heading; the dialog's accessible name                                                                                             |
| `description`                           | –                    | Text under the title; the accessible description                                                                                       |
| `actions`                               | –                    | Buttons along the bottom, outside the scrolling content                                                                                |
| `size`                                  | `md`                 | Width preset: `sm` 360 · `md` 480 · `lg` 640 px (never wider than the container), or `full`: the whole viewport, inside the safe areas |
| `titleHidden`                           | `false`              | Hide the title visually; it stays the accessible name and `h2`                                                                         |
| `dismissible`                           | `true`               | Escape, backdrop and close button; `false` leaves only your actions                                                                    |
| `closeButton`                           | `true`               | Show the close button; `false` hides it while Escape and the backdrop still close the dialog                                           |
| `keepMounted`                           | `false`              | Keep the content in the DOM while closed (state survives closing)                                                                      |
| `labels`                                | `{ close: "Close" }` | Built-in strings                                                                                                                       |
- Focus moves to the first control in the content (else the first action, else the dialog) and returns to where it was.
- The content is mounted only while the dialog is open. Closed, the `<dialog>` element is empty (also when rendered on a server); the content mounts in the same render that opens it and unmounts when the closing transition has ended (at once when there is none, as under reduced motion). So every opening starts fresh: fields are back at their defaults. Reopening before the fade has finished keeps the content. `keepMounted` keeps the content in the DOM while closed, for state that must survive closing (a half-filled form) or content that is expensive to rebuild.
- The page behind is inert (native modal). Escape closes the topmost layer only: a Menu, Select or Tooltip inside closes first. A pointer down on the backdrop closes it, unless a nested layer is open.
- The content scrolls between a fixed header and actions. Below a container width of 36rem the dialog docks to the bottom edge, except at `size="full"`, which fills the container at every width (no radius, border or shadow; it fades without scaling).
- `titleHidden` keeps the title as the dialog's name and heading for screen readers but draws only the close button, for content that names itself (a full-size page preview).
- `closeButton={false}` hides the header's close button but keeps Escape and the backdrop, for a dialog whose own actions close it (a label picker) or a progress overlay; with `titleHidden` too the header takes no room. Keep a way to close it: Escape is not discoverable on touch screens without a keyboard, so give it an action or a backdrop.
- Inside a Toaster, toasts raised while it is open show above it and move back to the page when it closes.
- Never writes to `<html>` or `<body>` (no scroll lock; the content uses `overscroll-behavior: contain`). Works inside shadow roots.

Tokens: `--cy-dialog-radius`, `--cy-dialog-padding`, `--cy-dialog-width-{sm,md,lg}`, `--cy-dialog-scrim`.
