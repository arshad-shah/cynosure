# Phase 04 — Core utilities

> **Goal:** Ship the building blocks that every component depends on: `Slot`, `Portal`, `VisuallyHidden`, `cn`, the variant helper, controllable-state hook, and the rest of the hook library.

**Depends on:** Phases 01, 02, 03.
**Blocks:** Phases 05+ (every component uses these).

---

## Inventory

### Components (three)
- `Slot` — render-as-child composition (clones props onto a child element).
- `Portal` — renders into `document.body` or a custom container.
- `VisuallyHidden` — `.sr-only` done right, with the `:focus` escape hatch.

### Helpers
- `cn(...inputs)` — concatenates/filters class names (a tiny implementation, not `clsx`).
- `cva` re-export with repo-wide config (tailwind-merge not needed since we're not on Tailwind; class merging is literal).
- `createContext<T>(name, options?)` — typed factory that throws a clear error when used outside provider.
- `composeRefs(...refs)` — standard ref-merger.
- `composeEventHandlers(theirs, ours)` — calls theirs, respects default-prevented, then calls ours.
- `callAll(...fns)` — tiny event-handler combiner.
- `getOwnerDocument(el)` — for components that create portals / query the document.

### Hooks (the full set)

| Hook | Purpose |
|------|---------|
| `useControllableState` | Unified controlled/uncontrolled pattern for form-like components |
| `useId` | SSR-safe stable IDs (wraps React 19's `useId`) |
| `usePrevious` | Track previous value |
| `useDebouncedValue` | Debounced value for filters |
| `useThrottledCallback` | Throttled callback |
| `useInterval` | Declarative setInterval |
| `useTimeout` | Declarative setTimeout |
| `useHotkeys` | Keyboard shortcut matcher; respects contentEditable |
| `useClipboard` | `navigator.clipboard` wrapper with success/failure state |
| `useLocalStorage` / `useSessionStorage` | Storage-sync'd state |
| `useIsomorphicLayoutEffect` | SSR-safe layout effect |
| `useIntersection` | IntersectionObserver wrapper |
| `useResizeObserver` | Per-element resize observer |
| `useMutationObserver` | For watching DOM attribute changes |
| `useFocusTrap` | Focus trap for modals/dialogs (prefer React Aria's if possible) |
| `useFocusReturn` | Restore focus to a triggering element on unmount |
| `useDisclosure` | `{ isOpen, onOpen, onClose, onToggle }` |
| `useMediaQuery` | Reactive media-query matcher |
| `useBreakpoint` | Strongly typed reactive breakpoint (from Phase 03) |
| `useMergedRef` | Forward merging refs for the Slot pattern |
| `useCallbackRef` | Stable callback ref |

All hooks live in `@lumen/react/hooks` and are also re-exported from the root. They use **no** runtime dependencies beyond React.

---

## `Slot` — the composition primitive

`Slot` is the cornerstone of Lumen's "primitives compose other components" model. Pattern is Radix's `asChild`.

### Why
Every interactive component (Button, Link, MenuItem, …) should be able to render as any underlying element without duplicating logic. Instead of `<Button as="a">`, we use:

```tsx
<Button asChild>
  <a href="/docs">Docs</a>
</Button>
```

`Button` renders its behaviour/classes onto the anchor by cloning it.

### API

```tsx
<Slot ref={ref} className="x" onClick={handler}>
  {child}  // must be a single React element
</Slot>
```

### Implementation essentials

- Merge `className` (concatenate).
- Merge `style` (object spread; Slot wins for shared keys but warns in dev).
- Merge refs via `composeRefs`.
- Merge event handlers via `composeEventHandlers`.
- If child is a Fragment, throw a dev-time error.
- Support `Slottable` sentinel for complex children (see Radix docs for the `Slottable` pattern — allows `<Slot><span/>Text<Slottable><Box/></Slottable></Slot>`).

Reference implementation: closely mirror `@radix-ui/react-slot`. **Don't fork it — depend on it.** The utility is too subtle to re-implement safely.

```bash
pnpm --filter @lumen/react add @radix-ui/react-slot
```

Then re-export as `Slot` from `@lumen/react`.

---

## `Portal`

React 19 has `createPortal` directly. Build a tiny wrapper that:

- SSR-safe: renders `null` on server, portals on client.
- Accepts `container` prop (element or function returning element); defaults to `document.body`.
- Supports `disabled` prop to conditionally bypass portalling (useful for testing).

```tsx
<Portal container={() => document.getElementById('overlay-root')}>
  <Dialog />
</Portal>
```

---

## `VisuallyHidden`

The classic `.sr-only` pattern, implemented as a component with a ref-forwarding wrapper.

```css
.lumen-vh {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Used everywhere for screen-reader labels on icon-only buttons, etc.

---

## `cn` — class-name combinator

No `clsx` or `classnames` dependency. Inline implementation; six lines:

```ts
export type ClassValue = string | number | boolean | null | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (typeof i === 'string' || typeof i === 'number') out.push(String(i));
    else if (Array.isArray(i)) { const s = cn(...i); if (s) out.push(s); }
  }
  return out.join(' ');
}
```

Yes, that's genuinely it. No tailwind-merge — we don't have conflicting utilities to resolve because we're using vanilla-extract recipes, not Tailwind.

---

## `useControllableState` — the controlled/uncontrolled bridge

This is the most important hook. Every form-like component uses it to support both modes:

```tsx
// Uncontrolled (internal state):
<Switch defaultChecked />

// Controlled (parent owns state):
<Switch checked={on} onCheckedChange={setOn} />
```

### API

```ts
interface UseControllableStateParams<T> {
  /** Controlled value from props (undefined means uncontrolled). */
  value?: T;
  /** Default value for uncontrolled mode. */
  defaultValue?: T;
  /** Change handler — fires in both modes. */
  onChange?: (value: T) => void;
}

function useControllableState<T>(params: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void];
```

### Invariants

- If `value` starts defined and later becomes undefined, warn in dev (the component is switching modes).
- If `value` starts undefined and later becomes defined, warn in dev.
- In controlled mode, `setValue` calls `onChange` but does NOT update internal state (consumer must update `value`).
- In uncontrolled mode, `setValue` updates internal state AND calls `onChange`.

### Implementation sketch

```ts
export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateParams<T>) {
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled!;
  const onChangeRef = useCallbackRef(onChange);

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (p: T) => T)(current) : next;
    if (!isControlled) setUncontrolled(resolved);
    if (!Object.is(resolved, current)) onChangeRef?.(resolved);
  }, [current, isControlled, onChangeRef]);

  // dev-mode warning on mode switch
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // …warn on isControlled change between renders
    }
  }, [isControlled]);

  return [current, setValue] as const;
}
```

---

## `createContext` — typed context factory

```ts
export function createContext<T>(name: string): [React.Provider<T>, () => T];

const [ThemeProvider, useThemeContext] = createContext<ThemeContextValue>('ThemeProvider');
```

- Returns a tuple: a real Provider and a hook that throws `"useThemeContext must be used within a ThemeProvider"` when called outside.
- Use this pattern in every compound component (Tabs, Dialog, Menu, …).

---

## `cva` — variants

Install `cva` v1:

```bash
pnpm --filter @lumen/react add cva
```

Re-export from a shared module to establish repo conventions:

```ts
// packages/react/src/utils/variants.ts
import { cva, cx, compose, defineConfig, type VariantProps } from 'cva';

export { cva, cx, compose, defineConfig };
export type { VariantProps };
```

No `tailwind-merge` hook — we're authoring class names we fully own (vanilla-extract recipes), so there's no conflict to resolve.

---

## Package structure after this phase

```
packages/react/src/
├── components/              # (empty; Phase 05 starts adding)
├── hooks/
│   ├── useControllableState.ts
│   ├── useCallbackRef.ts
│   ├── useMergedRef.ts
│   ├── useDisclosure.ts
│   ├── useMediaQuery.ts
│   ├── useBreakpoint.ts
│   ├── useDebouncedValue.ts
│   ├── useThrottledCallback.ts
│   ├── useInterval.ts
│   ├── useTimeout.ts
│   ├── useHotkeys.ts
│   ├── useClipboard.ts
│   ├── useLocalStorage.ts
│   ├── useSessionStorage.ts
│   ├── useIsomorphicLayoutEffect.ts
│   ├── useIntersection.ts
│   ├── useResizeObserver.ts
│   ├── useMutationObserver.ts
│   ├── useFocusTrap.ts
│   ├── useFocusReturn.ts
│   ├── useReducedMotion.ts   (moved from Phase 03, re-export)
│   ├── useDirection.ts       (moved from Phase 03, re-export)
│   ├── useId.ts
│   ├── usePrevious.ts
│   └── index.ts
├── primitives/
│   ├── Slot.ts               (re-export of @radix-ui/react-slot)
│   ├── Portal.tsx
│   ├── VisuallyHidden.tsx
│   └── index.ts
├── theme/                    (from Phase 03)
├── utils/
│   ├── cn.ts
│   ├── composeRefs.ts
│   ├── composeEventHandlers.ts
│   ├── callAll.ts
│   ├── createContext.tsx
│   ├── getOwnerDocument.ts
│   ├── variants.ts           (cva re-export)
│   └── index.ts
└── index.ts
```

---

## Testing

Every hook and utility gets a Vitest unit test. Naming convention: `<file>.test.ts` alongside the source.

Examples to write:

- `useControllableState.test.ts` — 5+ tests: uncontrolled, controlled, mode-switch warning, onChange fires in both modes, lazy-default support.
- `cn.test.ts` — falsy values, nested arrays, null/undefined, empty inputs.
- `composeRefs.test.ts` — function refs, object refs, mixed, null-tolerance.
- `composeEventHandlers.test.ts` — theirs runs first, preventDefault short-circuits ours, error propagation.
- `createContext.test.ts` — throws with helpful name outside provider, provides inside.
- `Portal.test.tsx` — renders to `document.body`, respects `container`, SSR renders null.
- `VisuallyHidden.test.tsx` — has the right inline styles; content readable by screen readers (via snapshot of computed styles).

All tests run in Vitest browser mode except pure-logic ones (which can run in `node` env if faster).

---

## Exit criteria

- [ ] Every item in the "Inventory" section exists and is exported from `@lumen/react`.
- [ ] Every hook has ≥1 Vitest unit test; `useControllableState` has ≥5.
- [ ] `pnpm test` passes; coverage for `hooks/` and `utils/` ≥ 90% lines.
- [ ] `Slot`, `Portal`, `VisuallyHidden` have Storybook stories (even if minimal).
- [ ] `pnpm build` produces per-entry output for hooks (e.g. `dist/hooks/useDisclosure.js`) — add `src/hooks/*.ts` to tsup `entry` to verify tree-shaking works.
- [ ] Playground uses `useMediaQuery` and `useDisclosure` to demonstrate they work.
- [ ] Bundle size sanity check: a minimal consumer importing `useDisclosure` only pulls ≤1 KB gzipped of Lumen code (run `pnpm exec size-limit` or a manual Rollup build in CI).

## Decisions to log

- Whether to depend on `@radix-ui/react-slot` or reimplement. **Decision: depend on it.** It's 600B gzipped and the subtle edge cases are done right.
- Whether `useHotkeys` depends on `react-hotkeys-hook`. **Decision: roll our own.** The dep is too opinionated and we want the API under our control.
