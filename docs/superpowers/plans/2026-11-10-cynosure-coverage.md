# Cynosure Coverage Components Implementation Plan (Plan 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the generic components and icons that the cross-product audit (Plan 4 Task 8b) found missing, so products can drop their own versions.

**Source:** The audit's per-product results stay outside this public repo; Arshad has them. This plan lists only generic pieces, with no product internals.

**Scope:** React only. The non-React path for Astro and vanilla sites, and a Starlight bridge, are deferred (Arshad, 2026-11-10). Brand marks (GitHub, LinkedIn, npm…) are not redrawn as Facet icons: they are filled trademarks, and products use the official SVGs.

**Architecture and constraints:** Unchanged from Plan 4 (`docs/superpowers/plans/2026-11-10-cynosure-evidence.md`, Global Constraints). A new native element needs a foundation first. Every component is scaffolded with `pnpm cy new component`, written story-first, and has a README with `## Used by`. Size budget ≤ 3 kB JS + CSS gzip unless a task states otherwise.

## Tasks

Smallest first, then the larger pieces.

- [x] **Task 1: Facet icons.** 46 new icons in the existing 15 categories (184 in all, with `alert` added for Steps): settings, star, star-off, printer, compare, wrench, swap, book-open, message-plus, alert-circle, minus-circle, list-checks, locate, briefcase, calculator, compass, graduation-cap, headphones, target, scan-line, wifi-off, network, plug, puzzle, bot, activity, inbox, hard-drive, workflow, zap, bold, italic, underline, strikethrough, quote, align-center, align-right, align-justify, rotate, brush, paint-bucket, shadow, anchor, laptop, tablet, repeat.
- [x] **Task 2: Skeleton.** Loading placeholders (text lines, block, circle); reduced motion stops the shimmer; hidden from assistive technology, with the busy state on the region that owns it.
- [x] **Task 3: Grid.** Responsive layout primitive (columns or min item width, gap tokens).
- [x] **Task 4: Steps.** Ordered progress through a flow (`aria-current="step"`), horizontal and vertical, optional clickable steps.
- [x] **Task 5: DescriptionList.** Term and detail pairs, stacked or side by side.
- [x] **Task 6: `useAnnounce`.** Built as `<Announcer>` plus `useAnnounce()`. Polite or assertive live-region announcements without writing to `<body>`.
- [x] **Task 7: `themeInitScript()`.** Returns the text of a tiny script that sets the saved theme before first paint; products place it themselves (Cynosure injects nothing).
- [x] **Task 8: Prose.** Typography for rendered Markdown and long text, all tokens.
- [x] **Task 9: Menu point anchor.** Built as `ContextMenu` on a shared `MenuPanel`. Open Menu at a pointer position (context menus), with keyboard opening at the focused item.
- [x] **Task 10: Navigation and app shell.** Built as `SideNav` and `AppShell` (plus `side="start"` for Sheet). Side navigation, top bar and a responsive shell that collapses to a Sheet on small screens.
- [x] **Task 11: NumberField.** Built on TextField: steppers, min, max, step, locale-aware parsing, forms.
- [x] **Task 12: FileDrop.** A file input foundation first, then a drop zone with keyboard and touch picking, accept and size checks.
- [x] **Task 13: SplitPane.** Resizable panes with an APG window-splitter handle (keyboard, pointer, touch).
- [ ] **Task 14: TagInput.** Free and suggested tags, built on TextField and Combobox patterns.
- [ ] **Task 15: CodeBlock.** Code display with copy (CopyButton) and a highlighter slot; no highlighter bundled.
- [ ] **Task 16: SortableList.** Reorder by pointer, touch and keyboard, with announcements.
- [ ] **Task 17: Table.** Semantic table with sorting, selection and sticky header.

Each task ends with the gates (`pnpm verify`), a PROGRESS update, a commit and a push.
