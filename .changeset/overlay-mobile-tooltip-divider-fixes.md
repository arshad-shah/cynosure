---
"@arshad-shah/cynosure-react": patch
---

Follow-up fixes from the menu/design refresh (PR #95) that landed without their
own changelog entry:

- **Overlays on mobile:** dialogs, drawers, popovers, menus, the command
  palette, and the date-picker calendar now cap their width/height to the
  viewport (using `dvh` for mobile browser chrome) and scroll instead of
  overflowing small screens.
- **Tooltip beak:** the left/right caret is rendered with explicit per-side
  geometry instead of a rotated caret, so it sits on the edge facing the
  trigger at a consistent size (no more tiny/mis-placed beak).
- **Divider:** the default `tone` is now `default` (visible on light surfaces
  instead of the near-invisible `subtle`), and a new `strong` tone is available
  for emphasis.
