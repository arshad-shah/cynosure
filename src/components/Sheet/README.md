# Sheet

A Dialog docked to an edge: the bottom (full width) or the inline end (full height). Same props, focus, Escape, backdrop and label behaviour as `Dialog`, plus `side`.

```tsx
<Sheet open={open} onOpenChange={setOpen} side="end" title="Settings">
  <Switch label="Compact rows" />
</Sheet>;
```

| Prop                    | Default  | Notes                                                                              |
| ----------------------- | -------- | ---------------------------------------------------------------------------------- |
| `side`                  | `bottom` | `bottom` (full width, up to 85% tall) · `end` (full height; left in RTL)           |
| `size`                  | `md`     | Width of an `end` sheet: `sm` 320 · `md` 400 · `lg` 560 px                         |
| every other Dialog prop | –        | `open`, `onOpenChange`, `title`, `description`, `actions`, `dismissible`, `labels` |
- Slides in from its edge; no motion under reduced motion.
- The bottom sheet keeps its actions above the home indicator (`safe-area-inset-bottom`).

Tokens: `--cy-sheet-radius`, `--cy-sheet-width-{sm,md,lg}`, `--cy-sheet-max-height` (and the Dialog tokens for padding and scrim).

## Used by

Aperture (inspector panel), web apps (mobile navigation, filters on phones), extension side panels.
