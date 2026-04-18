# @arshad-shah/cynosure-icons

> Icon re-exports for Cynosure UI — a thin passthrough of [Lucide React](https://lucide.dev/) tuned for tree-shaking.

Every icon Lucide ships is re-exported by name. Bundlers with proper tree-shaking — Vite, Rollup, Webpack ≥5, Next.js — pick up only the icons you import. The package exists so the Cynosure ecosystem has a single, version-pinned icon source; use it directly if you want one too, or keep importing `lucide-react` if you'd rather not add a layer.

---

## Install

```bash
pnpm add @arshad-shah/cynosure-icons
```

Peer requirements: `react@^19`.

---

## Usage

```tsx
import { ChevronRight, Search, Sun, Moon } from '@arshad-shah/cynosure-icons';

export function ThemeToggle({ isDark }: { isDark: boolean }) {
  return isDark ? <Moon size={18} /> : <Sun size={18} />;
}
```

Icons accept [standard Lucide props](https://lucide.dev/guide/packages/lucide-react) — `size`, `color`, `strokeWidth`, plus any SVG attribute.

### With `IconButton`

Cynosure's `IconButton` component pairs cleanly with these icons:

```tsx
import { Search } from '@arshad-shah/cynosure-icons';
import { IconButton } from '@arshad-shah/cynosure-react/icon-button';

<IconButton aria-label="Search"><Search /></IconButton>
```

---

## Types

`LucideIcon` and `LucideProps` are re-exported for places you need the icon type directly:

```ts
import type { LucideIcon } from '@arshad-shah/cynosure-icons';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}
```

---

## Why a separate package?

- **Version pin** — Cynosure components that reference icons pin to this package, so the whole ecosystem moves through one upgrade.
- **No bundler surprises** — the package is `"sideEffects": false`, so tree-shaking eliminates unused icons even in edge-case build configs.
- **Stable import path** — if Cynosure ever swaps icon providers (or adds custom ones), the import path stays the same for consumers.

---

## Links

- [Main repo](https://github.com/arshad-shah/cynosure)
- [Lucide icon gallery](https://lucide.dev/icons/) — browse every available icon by name
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah). Icons themselves are © Lucide contributors, [ISC licensed](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
