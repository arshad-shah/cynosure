# @arshad-shah/cynosure-core

> Headless primitives, hooks, and utilities that underpin Cynosure UI.

Most application developers want [`@arshad-shah/cynosure-react`](https://www.npmjs.com/package/@arshad-shah/cynosure-react) instead — it's the batteries-included component library. This package is the substrate it sits on: low-level building blocks meant for library authors, advanced consumers, and anyone assembling their own components on top of Cynosure's behaviour layer.

---

## Install

```bash
pnpm add @arshad-shah/cynosure-core
```

Peer requirements: `react@^19`, `react-dom@^19`.

---

## What's inside

- **Hooks** — `useId`, `useMergedRef`, `useControllableState`, focus-trap utilities, keyboard-nav helpers
- **Utilities** — DOM owner-document resolution, polymorphic `as` typings, SSR-safe helpers
- **Primitives** — unstyled behaviour wrappers that the `react` package composes into themed components
- **Types** — the shared TypeScript vocabulary the rest of Cynosure's packages reference

Every export is a single-purpose building block. None of them render visible UI on their own.

---

## Usage

```ts
import { useMergedRef, useControllableState } from '@arshad-shah/cynosure-core';

function MyInput({ value, defaultValue, onValueChange, ...props }) {
  const [controlledValue, setControlledValue] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  // …
}
```

Because the package has no styles, nothing is imported implicitly. There are no side effects at module load outside of the CSS files consumers explicitly opt into via subpath imports.

---

## When to use this directly

- You're building a component library that wants Cynosure's behaviour layer without its styling decisions
- You need a Cynosure hook in a component that isn't wrapped in `@arshad-shah/cynosure-react`
- You're writing a custom theme or token pipeline and want to reuse the type vocabulary

If none of those apply, you probably want `@arshad-shah/cynosure-react`.

---

## Links

- [Main repo](https://github.com/arshad-shah/cynosure)
- [Architecture overview](https://github.com/arshad-shah/cynosure/blob/main/docs/specs/ARCHITECTURE.md)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
