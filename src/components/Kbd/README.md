# Kbd

Keyboard shortcut: drawn key caps joined by a drawn separator (no "+" glyph), with a spoken combination for screen readers ("Control plus K"). Common names are spoken in full (Ctrl → Control, Cmd → Command, Esc → Escape…); override with `label`.

```tsx
<Kbd keys={["Ctrl", "K"]} />;
```

## Tokens

- `--cy-kbd-{radius,bg,border}`

## Used by

Aperture (command palette hints), Prism (shortcuts help), Verql, Stepframe.
