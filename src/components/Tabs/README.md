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
| `labels`                              | –                 | `close(name)`, `moved(name, position, total)`   |


`TabList`: `label`, `onReorder(values)` (reorderable tabs). `Tab`: `value`, `icon`, `disabled`, `onClose` (closable tab). `TabPanel`: `value`, `keepMounted` (keep hidden content mounted). Tabs without a `TabPanel` (e.g. routed content) are valid: they simply omit `aria-controls`.

- One Tab stop; arrows (RTL aware), Home and End; disabled tabs skipped; Tab moves to the panel.
- Removing the selected tab selects the one now in its place (or the previous one).
- **Document tabs.** `onClose` on a Tab adds a close button beside its label, and Delete (or Backspace) on the focused tab closes it; the tab now in its place is selected and focused. The close button is for the pointer: it is out of the tab order and hidden from screen readers, which are told about Delete through `aria-keyshortcuts`. `onReorder` on the TabList lets people drag tabs along the list (through detent; on touch, hold briefly, so a swipe still scrolls) or press Ctrl+Shift (Cmd+Shift) with Left or Right; each move is announced.
- Overflowing lists scroll; edges with hidden tabs fade, and the selected or focused tab is scrolled clear of the fade.

Tokens: `--cy-tabs-gap`, `--cy-tabs-indicator`, `--cy-tabs-indicator-width`, `--cy-tabs-radius`.

**Printing:** a printout has every panel, in order. TabPanel renders the content of unselected panels while the page is printed (`beforeprint`), and the print stylesheet shows them.

## Used by

Prism (tree / raw / schema views), Aperture panels, settings pages.
