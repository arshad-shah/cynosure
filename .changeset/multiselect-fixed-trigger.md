---
'@arshad-shah/cynosure-react': minor
---

Rework `MultiSelect` for a fixed-height trigger and a better overflow story.

- The trigger no longer grows as you select — chips sit on a single row and
  any that don't fit collapse into a `+N` overflow badge (measured against the
  available width and re-measured on resize).
- Every option stays reachable: the dropdown now lists **all** items (with a
  search field at the top and a checkmark on selected rows) and toggles on
  click, instead of removing chosen items from the list. This also fixes a bug
  where, as the old trigger expanded, the popover could overlap it and make
  lower options unclickable.
- The trigger is now a `role="combobox"` element; selected values still submit
  via hidden inputs when `name` is set. New `searchPlaceholder` prop.

Breaking: the forwarded `ref` now points at the trigger element
(`HTMLDivElement`) rather than an inner text input, and the trigger exposes
`role="combobox"` (was a `textbox`). `TagsInput` (free-form entry) keeps its
own wrapping, inline-input layout.
