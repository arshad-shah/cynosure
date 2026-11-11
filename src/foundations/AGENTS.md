# src/foundations

The **only** modules allowed to render native interactive elements (`button`, `a`, `input`, `textarea`, `dialog`) and the SVG `Icon`. Everything else builds on these.

- Create with `pnpm cy new component <Name> --kind foundation`.
- Foundations are thin: semantics, refs, form behaviour (`type="button"` default, FormData, reset), no visual opinions except Icon.
- Each foundation still needs stories with play tests and a README with `## Used by`.
- If a composite needs a native element that has no foundation, add the foundation here first; never inline the element in the composite (`cy check` fails with `native-elements`).

Shared hooks also live here: `roving-focus.ts` (`useRovingFocus`), `field.ts` (`useField`), `client-layout-effect.ts` (`useClientLayoutEffect`), `virtual-window.ts` (`useVirtualWindow`: windowing for equal-height rows, sized by CSS and always rendering the focused row; used by Tree and VirtualList; `sizes` and `gap` for rows of different sizes, as DocumentViewport's pages) and `hotkey.ts` (`useHotkey`: global shortcuts that work in shadow roots, skip plain keys in text fields, and honour `data-cy-hotkeys="off"`; unit-tested in `tests/unit/hotkey.test.tsx`).

Shared helpers (use these instead of writing your own; a second copy is a review failure):
- `math.ts`: `clamp(v, lo = 0, hi = 1)`, safe when `hi < lo`.
- `dir.ts`: `isRtl(el)`.
- `keys.ts`: `isComposing(event)` (IME, including Safari's keyCode 229) and `stepKey(event, options)`, the slider keys (arrows, Shift and Page ±big, Home/End, RTL, one axis or both). Slider, SplitPane, CompareSlider and ColorField's area use it.
- `listbox.ts`: `seekEnabled` (next usable index), `isTypeaheadKey` and `useTypeahead` (the 500 ms word buffer, cycling on one letter). Select, Menu, Tree and VirtualList use them.
- `controllable.ts`: `useControllableState(value, defaultValue, onChange)` returns `[current, set, reset]`; `set` is stable; `reset` (form reset) never calls `onChange`. Every component with a controlled/uncontrolled value uses it (ColorField excepted: its prop is a string and its state a parsed colour).
- `zoom.ts`: `ZoomSetting`, `clampPercent` (25–800), `ZOOM_STEPS`, `zoomStep`, `zoomScale` (fit width or page), `anchoredScroll`. `zoom-gestures.ts`: `useZoomGestures` (Ctrl/Cmd+wheel and pinch around the pointer, Space+drag pan through `useDrag`, Ctrl/Cmd and = - 0; with `onPan`, the wheel, a finger and the empty background pan too). DocumentViewport, ZoomControls and PanZoomCanvas use them.
- `reorder.ts`: `moveItems(items, keys, to, getKey)`, the new order after a move (VirtualList's rows, Tabs' tabs).
- `tone-icons.ts`: `TONE_ICONS`, the icon for a message's tone (Notice, Toast).
- `drag.ts`: `useDrag(ref, { onStart, onMove, onEnd })`, detent's `bindPointer` bound once with fresh handlers, re-bound when the element changes; Escape and browser cancels arrive as `onEnd(session, true)`, so put the value back. `touchAction: "css"` leaves `touch-action` to the stylesheet (e.g. `pan-y`). Slider, SplitPane, CompareSlider, ColorField's area and TextArea's grip use it.
- `src/overlay/floating.ts`: `usePopover(el, open, onShow)` (every manual popover shows and hides through it), `useFloatingAnchor`, `useFloatingOffset`.
- `src/overlay/listbox-layer.ts`: `useListboxLayer`, the drop-down list of Select, Combobox and TagInput (show, width, position, dismissal).
