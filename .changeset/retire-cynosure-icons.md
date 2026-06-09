---
'@arshad-shah/cynosure-react': patch
---

Retire `@arshad-shah/cynosure-icons` from the workspace. The package was a
passthrough re-export of `lucide-react` intended to give the ecosystem a
single version-pinned icon source, but in practice no internal source file
ever imported it — `cynosure-react` has always called `lucide-react`
directly (53 call sites across forms, overlays, navigation, etc.). With
two providers in flight and no consumer in the middle, the indirection was
pure overhead.

Consumers wanting the same icons should import from `lucide-react`
directly:

```ts
// before
import { ChevronRight } from '@arshad-shah/cynosure-icons';

// after
import { ChevronRight } from 'lucide-react';
```

Tree-shaking is identical: `lucide-react` ships `sideEffects: false` and
every Cynosure component already uses named imports, so bundlers
(Vite / Rollup / Webpack ≥ 5) drop unused icons exactly as before. No
change to per-component bundle sizes.

The npm package will be deprecated separately so existing installs surface
a one-line notice instead of breaking.
