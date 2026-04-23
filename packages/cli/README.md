# @arshad-shah/cynosure-cli

Scaffolding CLI for Cynosure UI. One command, zero setup.

```bash
npx cynosure init
```

**Browse the components this CLI sets up, live:** [cynosure.arshadshah.com](https://cynosure.arshadshah.com)

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

## Links

- [Storybook — live component reference](https://cynosure.arshadshah.com)
- [Main repo](https://github.com/arshad-shah/cynosure)
- [`@arshad-shah/cynosure-react`](https://www.npmjs.com/package/@arshad-shah/cynosure-react) — the library this CLI wires up
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
