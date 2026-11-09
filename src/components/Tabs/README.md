# Tabs

APG tabs: `Tabs` holds the selection, `TabList` (named) holds `Tab`s, each `TabPanel` shows when its value is selected.

```tsx
<Tabs defaultValue="tree" onChange={setView}>
  <TabList label="Document views">
    <Tab value="tree" icon={list}>
      Tree
    </Tab>
    <Tab value="raw" icon={code}>
      Raw
    </Tab>
  </TabList>
  <TabPanel value="tree">…</TabPanel>
  <TabPanel value="raw">…</TabPanel>
</Tabs>;
```

| Prop (Tabs)                           | Default           | Notes                                           |
| ------------------------------------- | ----------------- | ----------------------------------------------- |
| `value` / `defaultValue` / `onChange` | first enabled tab | Controlled or uncontrolled                      |
| `activation`                          | `auto`            | `manual`: arrows move focus, Enter/Space select |
| `size`                                | `md`              | `sm` · `md` · `lg` (control heights)            |
| `variant`                             | `line`            | `line` underline · `soft` tinted pill           |

`Tab`: `value`, `icon`, `disabled`. `TabPanel`: `value`, `keepMounted` (keep hidden content mounted). Tabs without a `TabPanel` (e.g. routed content) are valid: they simply omit `aria-controls`.

- One Tab stop; arrows (RTL aware), Home and End; disabled tabs skipped; Tab moves to the panel.
- Removing the selected tab selects the one now in its place (or the previous one).
- Overflowing lists scroll; edges with hidden tabs fade, and the selected or focused tab is scrolled clear of the fade.

Tokens: `--cy-tabs-gap`, `--cy-tabs-indicator`, `--cy-tabs-indicator-width`, `--cy-tabs-radius`.

## Used by

Prism (tree / raw / schema views), Aperture panels, settings pages.
