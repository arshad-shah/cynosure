# Icons (Facet)

Facet icons share one grammar: 24 grid, 1.75 round stroke, softened-square geometry, stroke only (no fills). There are 136 icons in 15 categories (`ICON_CATEGORIES`): arrows, navigation, actions, editing, files, data, media, communication, status, time, security, people, devices, design, layout. Browse them in Storybook: **Foundations → Icon → Gallery** (hover a tile to see its motion).

```tsx
import { Icon } from "@arshad-shah/cynosure";
import { search } from "@arshad-shah/cynosure/icons";

<Icon icon={search} />                              // decorative
<Icon icon={search} label="Search" />               // role="img"
<Icon icon={search} size="lg" tone="accent" />      // sm 14 · md 16 · lg 20 · or px
<Icon icon={search} color="#14b8a6" />              // one-off colour
```

Import icons by name so unused ones are tree-shaken. Reserved words get an `Icon` suffix (`packageIcon`).

**Add one:** draw on a 24 grid with strokes only, export the SVG, then run `pnpm cy new icon <name> --from icon.svg --category <category>`. In the generated file set `motion` and mark the moving part `animate: true`. See `src/icons/AGENTS.md`.
