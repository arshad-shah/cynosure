---
'@arshad-shah/cynosure-react': minor
---

Unify every segmented control behind the shared **segmented track** container
introduced with the NumberInput redesign: a tinted, padded well (light `subtle`
tint, hairline border, 4px padding/gap) with raised tiles floating inside it.

- **Input** (and `SearchInput`): the multi-well row — addon slots, field,
  action wells — now sits inside the track; wells render as raised tiles and
  the focus ring lights up the track. `filled` / `ghost` tint the track, not
  the individual wells.
- **DatePicker / DateRangePicker / TimePicker**: the picker root is now the
  track; the lead icon, segments, and trigger pockets render as raised tiles.
- **ToggleGroup `attached`** (and `ThemeToggle`'s `segmented` variant): the
  attached bar is now the track; the selected item renders as a raised tile.
- **ButtonGroup `attached`**: buttons float as tiles in the track instead of
  merging borders.

No API changes — `attached`, `variant`, `size`, and state props all behave as
before. Visual-only: rendered DOM class names and the exact geometry change
(attached groups now show a 4px gap between segments instead of shared 1px
borders). Textarea keeps its single-card layout (it is not a segmented
control).
