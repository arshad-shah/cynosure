# src/foundations

The **only** modules allowed to render native interactive elements (`button`, `a`, `input`, `textarea`, `dialog`) and the SVG `Icon`. Everything else builds on these.

- Create with `pnpm cy new component <Name> --kind foundation`.
- Foundations are thin: semantics, refs, form behaviour (`type="button"` default, FormData, reset), no visual opinions except Icon.
- Each foundation still needs stories with play tests and a README with `## Used by`.
- If a composite needs a native element that has no foundation, add the foundation here first; never inline the element in the composite (`cy check` fails with `native-elements`).

Shared hooks also live here: `roving-focus.ts` (`useRovingFocus`), `field.ts` (`useField`), `client-layout-effect.ts` (`useClientLayoutEffect`) and `hotkey.ts` (`useHotkey`: global shortcuts that work in shadow roots, skip plain keys in text fields, and honour `data-cy-hotkeys="off"`; unit-tested in `tests/unit/hotkey.test.tsx`).
