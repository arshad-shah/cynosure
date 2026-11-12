# src/foundations

The **only** modules allowed to render native interactive elements (`button`, `a`, `input`, `textarea`, `dialog`) and the SVG `Icon`. Everything else builds on these.

- Create with `pnpm cy new component <Name> --kind foundation`.
- Foundations are thin: semantics, refs, form behaviour (`type="button"` default, FormData, reset), no visual opinions except Icon.
- Each foundation still needs stories with play tests and a README.
- **Who builds on a foundation** (`FOUNDATION_USERS` in `tools/cli/lib/check.ts`, enforced by `cy check`): only composites whose element no component covers. ButtonBase: Button, and patterns that are buttons but not Buttons (Card as a whole-card button, Disclosure's trigger, Menu items, Menubar's menu titles, Select's trigger and options, SideNav entries, Steps, Table's sort headers, Tabs, ColorSwatches' swatches). LinkBase: Link, Button's link form, Card as a whole-card link, SideNav entries. InputBase: TextField, and CommandPalette's combobox input. TextAreaBase: TextArea. ChoiceBase: Checkbox and SegmentedControl. DialogBase: Dialog and CommandPalette. FileInputBase: FileDrop and KeyValueEditor's file picker. Everyone else uses those components. Icon and HiddenValue are parts any component may use.
- If a composite needs a native element that has no foundation, add the foundation here first; never inline the element in the composite (`cy check` fails with `native-elements`).

## Who builds on a foundation

`FOUNDATION_USERS` in `tools/cli/lib/check.ts` lists the composites that may import a foundation directly (`foundation-use`); every other composite renders the component that owns the element. The reasons:

- **ChoiceBase**: Checkbox, Switch and RadioGroup each own one native choice control (checkbox, `role="switch"` checkbox, radio) and draw its skin in a Choice row; SegmentedControl's segments are radios no other component draws. Choice itself renders no input: it hands its control the input's ids and handlers.

Shared hooks also live here: `roving-focus.ts` (`useRovingFocus`, and `TOOLBAR_ITEMS`, the selector of a toolbar's controls, used by Toolbar and StatusBar), `field.ts` (`useField`), `client-layout-effect.ts` (`useClientLayoutEffect`), `virtual-window.ts` (`useVirtualWindow`: windowing for equal-height rows, sized by CSS and always rendering the focused row; used by Tree and VirtualList; `sizes` and `gap` for rows of different sizes, as DocumentViewport's pages) and `hotkey.ts` (`useHotkey`: global shortcuts that work in shadow roots, skip plain keys in text fields, and honour `data-cy-hotkeys="off"`; `hotkeyFromEvent`, the shortcut a key press makes, written so `matchesHotkey` matches it again, which HotkeyField records with; unit-tested in `tests/unit/hotkey.test.tsx` and `tests/unit/hotkey-record.test.ts`).

Shared helpers (use these instead of writing your own; a second copy is a review failure):
- `math.ts`: `clamp(v, lo = 0, hi = 1)`, safe when `hi < lo`; `decimals(n)` (exponent notation included: 1e-7 has 7), `roundLike(v, step, min)` (rounds away floating-point noise to the most decimals of its sources) and `plainNumber(n)` (no exponent notation, for ARIA values and forms). Slider and NumberField step with them (`tests/unit/math.test.ts`).
- `dir.ts`: `isRtl(el)`.
- `focus.ts`: `deepActiveElement(doc?)`, the focused element looking inside shadow roots (`document.activeElement` stops at the host). Use it wherever focus is read: dismissal's focus return, Popover's Tab trap, Dialog's return target, Toast.
- `motion.ts`: `transitionTime(style)`, how long a computed style's transitions take to finish (longest duration plus its delay, in ms): the wait before an overlay unmounts after its exit (Dialog, Toast).
- `keys.ts`: `isComposing(event)` (IME, including Safari's keyCode 229) and `stepKey(event, options)`, the slider keys (arrows, Shift and Page ±big, Home/End, RTL, one axis or both). Slider, SplitPane, CompareSlider and ColorField's area use it.
- `listbox.ts`: `seekEnabled` (next usable index), `isTypeaheadKey` and `useTypeahead` (the 500 ms word buffer, cycling on one letter). Select, Menu, Tree and VirtualList use them.
- `controllable.ts`: `useControllableState(value, defaultValue, onChange)` returns `[current, set, reset]`; `set` is stable; `reset` (form reset) never calls `onChange`. Every component with a controlled/uncontrolled value uses it (ColorField excepted: its prop is a string and its state a parsed colour).
- `zoom.ts`: `ZoomSetting`, `clampPercent` (25–800), `ZOOM_STEPS`, `zoomStep`, `zoomScale` (fit width or page), `anchoredScroll`. `zoom-gestures.ts`: `useZoomGestures` (Ctrl/Cmd+wheel and pinch around the pointer, Space+drag pan through `useDrag`, Ctrl/Cmd and = - 0; with `onPan`, the wheel, a finger and the empty background pan too). DocumentViewport, ZoomControls and PanZoomCanvas use them.
- `reorder.ts`: `moveItems(items, keys, to, getKey)`, the new order after a move (VirtualList's rows, Tabs' tabs).
- `use-follow.ts`: `useFollow(scroller, { follow, onAtBottomChange, content, onResize })` returns `{ onScroll, contentChanged, scrollToEnd }`: following the end of a scroller (a log, a chat). While at the end, growing content (watched through `content`, or reported with `contentChanged`) or a shrinking view keeps it there; only a move up releases it and reaching the end resumes it; `onAtBottomChange` reports each change (it starts true). ScrollArea and VirtualList use it.
- `qr.ts`: `qrMatrix(value, { level, mask })` (the QR encoder: versions 1–40, numeric, alphanumeric or UTF-8 bytes, Reed–Solomon, the lowest-penalty mask; matches the `qrcode` npm package, `tests/unit/qr.test.ts`), `qrPath` and `qrToSvg`. QRCode draws with it; it is exported for pages without React.
- `tone-icons.ts`: `TONE_ICONS`, the icon for a message's tone (Notice, Toast).
- `drag.ts`: `useDrag(ref, { onStart, onMove, onEnd })`, detent's `bindPointer` bound once with fresh handlers, re-bound when the element changes; Escape and browser cancels arrive as `onEnd(session, true)`, so put the value back. `touchAction: "css"` leaves `touch-action` to the stylesheet (e.g. `pan-y`). Slider, SplitPane, CompareSlider, ColorField's area, TextArea's grip and Toast's swipe use it.
- `image-outcome.ts`: `useImageOutcome(ref, key)`, a picture's way from loading to loaded or failed (the img's own events, plus the element's state for one that finished before React attached). Image and Avatar use it.
- `printing.ts`: `usePrinting()`, true from `beforeprint` to `afterprint` (flushed synchronously), for content that must be in the page when it is printed. TabPanel uses it to print every panel.
- `option-icon.tsx`: `OptionIcon` and the `OptionIconColor` props (`iconTone`, `iconColor`), an option's icon in its own colour, muted when the option is disabled. Select, Combobox, Menu and ContextMenu use it.
- `src/overlay/floating.ts`: `usePopover(el, open, onShow)` (every manual popover shows and hides through it), `useFloatingAnchor`, `useFloatingOffset(el, open)` (the `--_offset` gap in pixels, read on open; `floatingOffset(el)` reads it once).
- `src/overlay/listbox-layer.ts`: `useListboxLayer`, the drop-down list of Select, Combobox and TagInput (show, width, position, dismissal). The list itself is drawn with the `OptionList` component.
