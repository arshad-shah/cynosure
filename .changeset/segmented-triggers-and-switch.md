---
'@arshad-shah/cynosure-react': minor
---

Bring the dropdown triggers and the Switch into the segmented design language,
and stop clicks from painting a text-selection highlight.

- **Select & Combobox** now render as a segmented track — a tinted, padded
  well wrapping a raised value tile and a **separate chevron tile** — matching
  `NumberInput` / `Input` / the pickers. The focus ring lives on the track and
  `variant` (`outline` / `filled` / `ghost`) tints it. No API change; the
  shared trigger styles live in `forms/shared/segmentedTrigger.css.ts`.
- **Switch** gets a Material-You-style thumb: small when off, growing to fill
  the track as it slides on (and swelling while pressed). New `checkedIcon` /
  `uncheckedIcon` props put a custom glyph in the thumb (the on-state default
  stays a checkmark) — e.g. a sun/moon for a theme toggle.
- **Click highlight**: interactive controls (`button`, `summary`, and the
  `button`/`tab`/`option`/`menuitem`/`switch`/`radio`/`checkbox` roles) no
  longer show a blue text-selection highlight when clicked or double-clicked.
  Components that re-base with `all: unset` (Accordion, Tag) opt back out
  explicitly.
