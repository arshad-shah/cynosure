# Kbd

Keyboard shortcut: drawn key caps joined by a drawn separator (no "+" glyph), with a spoken combination for screen readers ("Control plus K"). Common names are spoken in full (Ctrl → Control, Cmd → Command, Esc → Escape…); override with `label`.

```tsx
<Kbd keys={["Ctrl", "K"]} />;
<Kbd keys="mod+shift+p" />; // Cmd Shift P on Apple platforms, Ctrl Shift P elsewhere
```

| Prop                                    | Default          | Notes                                                                                             |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `keys`                                  | –                | Required. The keys in order (`["Ctrl", "K"]`), or a shortcut as `useHotkey` writes it (`"mod+k"`) |
| `size`                                  | `md`             | `sm` · `md` · `lg`                                                                                |
| `label`                                 | spoken from keys | The text screen readers read instead of the joined key names                                      |
| `className` / `style`                   | –                | Layout only                                                                                       |
| `id`, `data-*`, `role`, `aria-*`, `ref` | –                | Set on the root element                                                                           |

**A shortcut string** (`keys="mod+shift+k"`) is shown with this platform's names: `mod` is Cmd on Apple platforms and Ctrl elsewhere, `alt` is Option or Alt, `meta` is Cmd or Win. It is hidden on touch-only screens (no hover, coarse pointer), where a shortcut means nothing. Keys given as a list are content (a help page) and stay.

## Tokens

- `--cy-kbd-{radius,bg,border}`
