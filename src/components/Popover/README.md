# Popover

A floating panel (non-modal dialog) anchored to its trigger, in the browser top layer.

```tsx
<Popover label="Filters" trigger={(props) => <Button {...props}>Filters</Button>}>
  <Stack gap="4">…</Stack>
</Popover>;
```

| Prop                                    | Default   | Notes                                                                                                                     |
| --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `trigger`                               | –         | Render prop: spread its props onto a Button or IconButton (ref, click, `aria-expanded`, `aria-controls`, `aria-haspopup`) |
| `anchor`                                | –         | `{ x, y }` in viewport pixels, or an element or virtual anchor, to place it against instead of the trigger (see below)    |
| `label`                                 | –         | Accessible name of the panel                                                                                              |
| `open` / `defaultOpen` / `onOpenChange` | `false`   | Controlled or uncontrolled                                                                                                |
| `placement`                             | `bottom`  | `top` · `bottom` · `start` · `end`; flips when it does not fit                                                            |
| `align`                                 | –         | `start` · `center` · `end` against the trigger (reading direction); unset: start edge above/below, centred beside         |
| `offset`                                | `6`       | Gap from the trigger or anchor, in pixels                                                                                 |
| `size`                                  | `md`      | Width preset: `sm` 240 · `md` 320 · `lg` 420 px                                                                           |
| `width`                                 | `content` | `content` (up to the preset) · `trigger` (at least the trigger's or anchor's width) · `fixed` (exactly the preset)        |
| `initialFocus`                          | `first`   | `first` control · the `panel` itself · `none` (focus stays where it is, such as a field being typed in)                   |
| `modal`                                 | `false`   | Keep Tab inside the panel (cycling through its tab stops: a toolbar or radio group counts once)                           |
| `closeOnFocusOut`                       | `true`    | A non-modal panel closes when focus moves outside it, its trigger and its anchor (Tab past its last control)              |
| `children`                              | –         | The panel's content                                                                                                       |
| `className` / `style`                   | –         | On the panel. Layout only                                                                                                 |
- Focus moves to the first control inside that Tab reaches (or the panel itself) and returns to the trigger on close. `initialFocus="panel"` focuses the panel; `initialFocus="none"` leaves focus where it is, and Tab from the trigger (or from an anchor the panel follows in the document) moves into it.
- Without `modal`, focus moving out of the panel (to anything but its trigger or anchor) closes it, so it never hangs open over what has focus; `closeOnFocusOut={false}` keeps it open.
- An anchor element counts as inside, like the trigger: pressing it does not close the panel.
- Escape closes only the topmost layer (nested popovers, a tooltip inside), via `useDismiss`. A click outside closes it, as does clicking the trigger again.
- Works inside shadow roots.

Tokens: `--cy-popover-padding`, `--cy-popover-radius`, `--cy-popover-width-{sm,md,lg}`.

- `anchor`: place it at a point (`{ x, y }` in viewport pixels, such as where a canvas was clicked) or beside any element or virtual anchor. `trigger` is then optional; control it with `open`, and focus goes back to where it was when it closes.
