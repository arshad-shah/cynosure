# ThemeToggle

Light / dark / system switch built from `SegmentedControl` with the Facet `sun`, `moon` and `monitor` icons. Uncontrolled it manages and persists the mode with `useColorMode` (any `{ get, set }` storage, sync or async).

```tsx
const { mode } = useColorMode();
<CynosureTheme mode={mode}>
  <ThemeToggle />
</CynosureTheme>;
```

| Prop                       | Default         | Notes                                                                        |
| -------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `value` / `onChange(mode)` | –               | Controlled use                                                               |
| `storage`                  | localStorage    | Uncontrolled persistence                                                     |
| `storageKey`               | `cy-color-mode` | The key the mode is saved under; pass the same to `themeInitScript({ key })` |
| `labels`                   | English         | `label`, `light`, `dark`, `system`                                           |
| `size`                     | `md`            | Shared vocabulary                                                            |
- `variant="cycle"`: one icon button that steps light, dark, system, for tight headers. Its name says the current mode and the next ("Colour mode: Light. Switch to Dark"); `labels.cycle(current, next)` overrides it.

## Used by

Every product with a theme switch: Prism, Aperture, Planr, portfolio, nimaz-web.
