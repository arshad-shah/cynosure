# Cynosure De-duplication Plan (Plan 7)

**Goal:** one implementation of each behaviour and no component that is only another component with a prop set (Arshad, 2026-11-10: "check everything for this kind of issue of duplication").

**Source:** a read-only audit of `src/` on 2026-11-10, ranked by value. Behaviour must not change except where the copies had drifted (then every component gets the best behaviour); each task keeps every story green and adds stories for the fixed drift.

## Tasks

- [x] **Task 1: Shared helpers in `src/foundations/`.**
  - `math.ts`: `clamp`
  - `dir.ts`: `isRtl(el)`
  - `controllable.ts`: `useControllableState(value, defaultValue, onChange)`
  - `keys.ts`: the pure `stepKey` (arrows, Shift ×big, Page, Home/End, RTL) and `isComposing(event)`
  - `listbox.ts`: `seekEnabled`, `isTypeaheadKey`, `useTypeahead`

  `useControllableState` moved to Task 5. Done: the shared helpers, with unit tests in `tests/unit/keys.test.ts` and `tests/unit/listbox.test.tsx`. Drift fixed: CommandPalette now has the 229 check, and Select ignores Ctrl/Command/Alt+letter for type-ahead, as Menu and Tree already did.

  Replace the copies: clamp ×8, RTL ×7, IME guard ×5 (CommandPalette lacked the 229 check), the 500 ms type-ahead in Select, Menu and Tree, and next-enabled seeking in Select and VirtualList (Combobox, TagInput and CommandPalette step through lists already filtered to usable items: plain index arithmetic, nothing to share).
- [x] **Task 2: Slider-style keys through `stepKey`.**
  - Covers Slider, CompareSlider, SplitPane, ColorField's area and NumberField (Up/Down only).
  - NumberField keeps its own Up/Down/Page handling: it snaps to the step and has no Home/End without a bound, so it is a spinbutton, not a slider.
  - Every slider gets the same keys: ±step, Shift ±big, Page ±big, Home/End, and arrows that follow RTL. CompareSlider stays LTR on purpose.
- [ ] **Task 3: Pointer drags through detent `bindPointer`** (rule 7).
  - Covers Slider, SplitPane (pointer only; its separator keeps its keys), ColorField's area and TextArea's resize grip.
  - Fixes the drift: ColorField missed pointercancel and pointer-id checks. All four gain Escape-to-cancel and touch-versus-scroll handling.
  - SignaturePad (raw pressure and tilt, palm rejection) and Toast's swipe (browser pointercancel on scroll) stay as they are, for the reasons in their files.
- [ ] **Task 4: Overlays.**
  - `usePopover` (with `onShow`) everywhere a manual popover is shown or hidden: Popover, Menu, Select, Combobox, TagInput, Tooltip, Toast. One `PopoverEl` type.
  - `useAnchoredListbox` for the Combobox, TagInput and Select list layer.
  - Select joins `useDismiss`, so it closes in layer order like Menu and Combobox.
- [ ] **Task 5: `useControllableState`** in the roughly 20 components that write the controlled and uncontrolled pattern by hand.
- [ ] **Task 6: Small shares.**
  - `luminance` exported from `tokens/color.ts` and used by ColorSwatches.
  - One tone-to-icon map for Toast and Notice.
  - One fade keyframe for Select and Combobox, if it can live where both bundles load it.
- [ ] **Task 7: Sheet.**
  - Sheet is `<DialogFrame side>`. Give Dialog a `side` prop.
  - Ask Arshad whether Sheet goes, or stays as a documented alias, before 1.0.

**Kept apart on purpose:**
- Stack and Inline: a common design-system pair whose CSS is already shared.
- SegmentedControl and RadioGroup: one is a compact strip, the other carries Field wiring and per-option descriptions.
- Tooltip and HoverCard: one is an accessible description, the other is passive and aria-hidden.
- Accordion's own arrows: APG keeps a tab stop per header.
- VirtualList's and Tree's keys: their rows are virtualised.
- SideNav's groups: needed for rail mode.

Each task ends with the gates, a PROGRESS update, a commit and a push.
