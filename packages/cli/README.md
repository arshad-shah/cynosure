# @arshad-shah/cynosure-cli

Scaffolding CLI for Cynosure UI. One command, zero setup.

```bash
npx cynosure init
```

## What it does

- Detects your framework (Next.js App Router, Next.js Pages, Vite, CRA, Remix)
- Picks the right entry file
- Adds the single CSS import (`@arshad-shah/cynosure-react/all.css`)
- Imports `CynosureProvider` — and for Next.js App Router, wraps `{children}` automatically
- Prints the install command for your package manager (pnpm / yarn / npm / bun)

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

```ts
// app entry
import '@arshad-shah/cynosure-react/all.css';
import { CynosureProvider } from '@arshad-shah/cynosure-react';

<CynosureProvider>{children}</CynosureProvider>
```

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
