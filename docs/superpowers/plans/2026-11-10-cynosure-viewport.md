# Cynosure Document Viewport Plan (Plan 8)

**Goal:** the tools app's scrolling, zoomable document (PDF pages and image editors) as Cynosure components, with one zoom and pan core that the later diagram canvas reuses.

**Source:** the tools repo's `document-viewport.tsx`, `use-viewport-gestures.ts` and `zoom-scale.ts` (audit 2026-11-10).

**Constraints:**
- As Plans 4–7. No duplication (AGENTS.md rule 1).
- Pointer dragging goes through `useDrag`.
- Windowing goes through `useVirtualWindow`.
- Overlays are not involved.

## Tasks

- [x] **Task 1: Zoom core (`src/foundations/zoom.ts`, `zoom-gestures.ts`).**
  - Pure maths, unit-tested:
    - `ZoomSetting` (`fit-width`, `fit-page`, `percent`)
    - `clampPercent` (25–800)
    - `zoomScale(setting, pages, viewport, gap)`
    - `zoomStep(percent, direction)`, through the usual preset steps
    - `anchoredScroll(scroll, anchor, factor)`
  - `useZoomGestures(scroller, percent, onZoom)`:
    - Ctrl/Cmd+wheel and a two-finger pinch zoom around the pointer.
    - Space+drag pans (through `useDrag`).
    - Ctrl/Cmd+= / − / 0 zoom while focus is inside the viewport.
- [x] **Task 2: Variable-size windowing.** `useVirtualWindow` takes `sizes` (one per row) and a `gap` for rows of different heights, such as pages of mixed sizes; equal rows keep the measured path.
- [x] **Task 3: DocumentViewport.**
  - Pages are virtualised, each a labelled region ("Page 3 of 12").
  - Zoom setting, controlled. Zooming keeps the content under the pointer in place.
  - Reports the visible pages and the current page (the one with the largest visible area).
  - `scrollTo` requests: a page, or a rect on it, optionally focusing it.
  - Zoom changes are announced.
  - `renderPage({ id, index, scale, visible, visibleRect })` draws each page.
- [x] **Task 4: ZoomControls.**
  - Zoom out, a Menu of fit and percent choices showing the current percent, and Zoom in.
  - Built from IconButton, Button and Menu.
  - Takes the same `ZoomSetting`.
- [ ] Later: the diagram canvas (free pan in both directions, nodes placed in canvas units) on the same core.

Each task ends with the gates, a PROGRESS update, a commit and a push.
