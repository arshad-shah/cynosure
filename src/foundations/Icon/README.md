# Icon (foundation)

Renders a Facet icon. Import icons by name so unused ones are tree-shaken.

```tsx
import { Icon } from "@arshad-shah/cynosure";
import { search } from "@arshad-shah/cynosure/icons";

<Icon icon={search} />                 // decorative (aria-hidden)
<Icon icon={search} label="Search" />  // role="img" with a name
```

- Sizes: `sm` 14, `md` 16, `lg` 20 (× scale), or a number in px.
- Props: `size` (`sm` 14, `md` 16, `lg` 20, or px), `tone` (`inherit`, `accent`, `neutral`, `muted`, `danger`, `success`, `warning`, `info`), `color` (any CSS colour), `label`.
- Tokens: `--cy-icon-size-{sm,md,lg}`, `--cy-icon-stroke` (1.75).
- Motion: plays when an ancestor has `.cy-motion-trigger` and is hovered, keyboard-focused or `[data-active]`. Durations follow `--cy-motion-slow`; reduced motion turns it off.
- Add icons with `pnpm cy new icon <name> --from file.svg`. See `docs/icons.md`.

## Used by

Every component that shows an icon; all products.
