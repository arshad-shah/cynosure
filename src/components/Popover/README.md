# Popover

A floating panel (non-modal dialog) anchored to its trigger, in the browser top layer.

```tsx
<Popover label="Filters" trigger={(props) => <Button {...props}>Filters</Button>}>
  <Stack gap="4">…</Stack>
</Popover>;
```

| Prop                                    | Default  | Notes                                                                                                                     |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `trigger`                               | –        | Render prop: spread its props onto a Button or IconButton (ref, click, `aria-expanded`, `aria-controls`, `aria-haspopup`) |
| `label`                                 | –        | Accessible name of the panel                                                                                              |
| `open` / `defaultOpen` / `onOpenChange` | `false`  | Controlled or uncontrolled                                                                                                |
| `placement`                             | `bottom` | `top` · `bottom` · `start` · `end`; flips when it does not fit                                                            |
| `size`                                  | `md`     | Width preset: `sm` 240 · `md` 320 · `lg` 420 px                                                                           |
| `modal`                                 | `false`  | Keep Tab inside the panel                                                                                                 |
- Focus moves to the first control inside (or the panel itself) and returns to the trigger on close.
- Escape closes only the topmost layer (nested popovers, a tooltip inside), via `useDismiss`. A click outside closes it, as does clicking the trigger again.
- Works inside shadow roots.

Tokens: `--cy-popover-padding`, `--cy-popover-radius`, `--cy-popover-width-{sm,md,lg}`.

## Used by

Prism (filters, view options), Aperture (inspectors), extension popups.
