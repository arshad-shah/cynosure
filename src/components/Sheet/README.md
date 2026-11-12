# Sheet

A Dialog docked to an edge: the bottom (full width), the inline end or the inline start (full height). Same props, focus, Escape, backdrop and label behaviour as `Dialog`, plus `side`.

```tsx
<Sheet open={open} onOpenChange={setOpen} side="end" title="Settings">
  <Switch label="Compact rows" />
</Sheet>;
```

| Prop                    | Default  | Notes                                                                                                                               |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `side`                  | `bottom` | `bottom` (full width, up to 85% tall) · `end` (full height; left in RTL) · `start` (full height; a navigation drawer; right in RTL) |
| `size`                  | `md`     | Width of an `end` or `start` sheet: `sm` 320 · `md` 400 · `lg` 560 px                                                               |
| every other Dialog prop | –        | `open`, `onOpenChange`, `title`, `description`, `actions`, `dismissible`, `keepMounted`, `labels`                                   |
- Slides in from its edge; no motion under reduced motion.
- As in Dialog, the content is mounted only while the sheet is open and unmounts after it has slid out, so every opening starts fresh. `keepMounted` keeps it in the DOM while closed (a drawer whose scroll position or expanded sections should survive).
- The bottom sheet keeps its actions above the home indicator (`safe-area-inset-bottom`).

Tokens: `--cy-sheet-radius`, `--cy-sheet-width-{sm,md,lg}`, `--cy-sheet-max-height` (and the Dialog tokens for padding and scrim).

## Used by

Aperture (inspector panel), web apps (mobile navigation, filters on phones), extension side panels.
