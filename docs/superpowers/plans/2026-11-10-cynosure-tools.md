# Cynosure Tools Components Implementation Plan (Plan 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover the UI the public tools repo (`arshad-shah/tools`, `src/shared/ui`) builds for itself, so it can move to Cynosure: floating and docked toolbars, signing, a move/resize box, and the smaller pieces below.

**Source:** an audit of the tools repo's shared UI on 2026-11-10 (Arshad's request), ordered by how central and how reused each piece is.

**Constraints:** as Plans 4 and 5. Pointer dragging uses `@arshad-shah/detent` where it fits (rule 7); overlays live in the top layer through the Popover API, never portaled to `<body>` (rule 4).

## Tasks

- [x] **Task 1: FloatingToolbar, DockedToolbar, useSelectionAnchor.** A compact toolbar anchored to a box or a text selection: flips and shifts to stay on screen, never covers its box, APG toolbar keys, Escape returns focus, Alt+F10 jumps in. The phone version docks to the bottom of the visual viewport above the on-screen keyboard and scrolls sideways instead of wrapping.
- [x] **Task 2: SignaturePad.** Ink drawing with pen pressure (simulated from speed for mouse and touch), coalesced events, one pointer at a time, palm rejection, strokes stored in a fixed coordinate space; undo is the parent's. Keyboard users get the Type or Upload path of a signing dialog pattern (documented).
- [x] **Task 3: SelectionFrame.** A move/resize/rotate box: handles by pointer (detent where it fits), arrows nudge, Alt+arrows resize, `[` and `]` rotate, Shift ×10, Escape cancels. Also the crop box.
- [x] **Task 4: Colour.** ColorField gains swatches (a radiogroup), recent colours and OKLCH output.
- [x] **Task 5: CompareSlider.** Before/after divider (arrows 1%, Shift 10%).
- [x] **Task 6: VirtualList.** Windowed list with ARIA roles and roving focus.
- [x] **Task 7: Smaller pieces**, without duplicating what exists (Arshad, 2026-11-10). ShortcutHint is not a component: Kbd `keys` takes a shortcut string ("mod+k"), named for the platform and hidden on touch-only screens; Menu and CommandPalette `shortcut` take it too. FloatingPalette and FloatingDock are not components: DockedToolbar gains `edge` (start/end side palette with a detent grip and Alt+arrows) and `floating` (a centred pill; a mode switcher is a SegmentedControl inside it). New: HoverCard (passive preview; shares `src/overlay/floating.ts` with FloatingToolbar), ProgressOverlay (Dialog + ProgressBar + Button), KeyValueEditor (SortableList rows). Done: Kbd shortcuts, HoverCard, ProgressOverlay, DockedToolbar `edge`/`onEdgeChange`/`floating`, KeyValueEditor (file-valued rows left out until a second product needs them).
- [x] **Task 8: SortableList grid and multi-select modes** (page rails, file grids). Grid: SortableList `layout="grid"`. Multi-select moving went to VirtualList instead (Arshad, 2026-11-10), which already has a virtualised multi-select: `onMove(keys, to)` with Alt+Up/Down and mouse or pen dragging, and `moveItems` to apply it; one selection model in the library.
- [ ] Later, larger: pan/zoom document viewport, data grid, code editor surface, charts.

Each task ends with the gates, a PROGRESS update, a commit and a push.
