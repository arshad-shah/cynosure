# Toolbar

APG toolbar: a named `role="toolbar"` group with one Tab stop. Arrow keys move between its controls (Left/Right, or Up/Down when `orientation="vertical"`; flipped in RTL), Home and End jump, disabled controls are skipped, and Tab leaves. Returning lands on the last focused control.

```tsx
<Toolbar label="Formatting">
  <IconButton icon={edit} label="Edit" />
  <SegmentedControl label="View" options={…} />
  <SearchField label="Search" labelHidden />
</Toolbar>
```

- Radios inside (SegmentedControl) are separate stops: arrows move focus, Space selects (APG toolbar pattern).
- Text fields keep their own arrow, Home and End keys.
- Controls added later join the group automatically.

Props: `label`, `orientation` (`horizontal`), `loop` (`true`), `className`/`style` (layout only). Tokens: `--cy-toolbar-gap`, `--cy-toolbar-padding`.
