# @arshad-shah/cynosure-cli

Scaffolding CLI for Cynosure UI. One command, zero setup.

```bash
npx cynosure init
```

## What it does

- Detects your framework (Next.js App Router, Next.js Pages, Vite, CRA, Remix)
- Picks the right entry file
- Imports `CynosureProvider` — and for Next.js App Router, wraps `{children}` automatically
- Prints the install command for your package manager (pnpm / yarn / npm / bun)

No CSS import is wired: `CynosureProvider` loads the design tokens itself, and each component's CSS auto-loads when imported.

## Flags

| Flag | Description |
| --- | --- |
| `--dry-run` | Print the changes without touching disk |
| `--cwd <path>` | Target directory (default: `process.cwd()`) |

## Manual equivalent

If detection fails, run:

```bash
pnpm add @arshad-shah/cynosure-react @arshad-shah/cynosure-tokens
```

```tsx
// app entry — no CSS import needed; the provider loads the tokens
import { CynosureProvider } from '@arshad-shah/cynosure-react';

<CynosureProvider>{children}</CynosureProvider>;
```

Then import components from their subpaths, e.g.
`import { Button } from '@arshad-shah/cynosure-react/button'`.

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
