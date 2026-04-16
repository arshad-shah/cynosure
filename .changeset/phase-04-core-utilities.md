---
'@lumen/react': minor
---

Phase 04 — core utilities, primitives, and the hook library.

`@lumen/react` gains the building blocks every subsequent component depends on:

- **Primitives:** `Slot` / `Slottable` (re-exported from `@radix-ui/react-slot`
  for the `asChild` composition pattern), an SSR-safe `Portal` with a `container`
  prop and a `disabled` bypass, and `VisuallyHidden` for screen-reader-only
  content.
- **Utilities:** a six-line `cn()` (no `clsx` dependency — vanilla-extract
  recipes author fully-owned class names), `composeRefs`, `composeEventHandlers`
  (`preventDefault`-aware short-circuit, mirroring Radix semantics), `callAll`,
  `getOwnerDocument`, a typed `createContext` factory that throws a helpful
  error outside its provider, and a curated `cva` / `cx` / `VariantProps`
  re-export from `class-variance-authority`.
- **Hooks:** `useControllableState` (the controlled/uncontrolled bridge with a
  dev-mode mode-switch warning), `useDisclosure`, `useMediaQuery`,
  `useCallbackRef`, `useMergedRef`, `useId`, `usePrevious`, `useDebouncedValue`,
  `useThrottledCallback`, `useInterval`, `useTimeout`, `useHotkeys` (with a
  cross-platform `mod` modifier), `useClipboard`, `useLocalStorage` /
  `useSessionStorage` (cross-tab sync, graceful SSR / private-mode fallback),
  `useIntersection`, `useResizeObserver`, `useMutationObserver`, `useFocusTrap`,
  `useFocusReturn`, `useIsomorphicLayoutEffect`, plus re-exports of the
  phase-03 hooks (`useReducedMotion`, `useDirection`, `useBreakpoint`) so every
  hook is reachable from `@lumen/react` or `@lumen/react/hooks`.

All hooks use **only** `react` as a runtime dependency; the only new runtime
dependencies at the package level are `@radix-ui/react-slot` and
`class-variance-authority`. Per-hook tsup entry points keep the tree-shake
graph honest — importing `useDisclosure` pulls well under 1 KB of Lumen code.
