# ThemeToggle

Light / dark / system switch built from `SegmentedControl` with the Facet `sun`, `moon` and `monitor` icons. Uncontrolled it manages and persists the mode with `useColorMode` (any `{ get, set }` storage, sync or async).

```tsx
const { mode } = useColorMode();
<CynosureTheme mode={mode}>
  <ThemeToggle />
</CynosureTheme>;
```

| Prop                       | Default      | Notes                              |
| -------------------------- | ------------ | ---------------------------------- |
| `value` / `onChange(mode)` | –            | Controlled use                     |
| `storage`                  | localStorage | Uncontrolled persistence           |
| `labels`                   | English      | `label`, `light`, `dark`, `system` |
| `size`                     | `md`         | Shared vocabulary                  |

## Used by

Every product with a theme switch: Prism, Aperture, Planr, portfolio, nimaz-web.
