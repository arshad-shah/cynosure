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

| Prop (Tabs)                           | Default           | Notes                                                                                                                       |
| ------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `value` / `defaultValue` / `onChange` | first enabled tab | Controlled or uncontrolled                                                                                                  |
| `activation`                          | `auto`            | `manual`: arrows move focus, Enter/Space select                                                                             |
| `size`                                | `md`              | `sm` · `md` · `lg` (control heights)                                                                                        |
| `variant`                             | `line`            | `line` underline · `soft` tinted pill                                                                                       |
| `labels`                              | –                 | `close(name)`, `closeUnsaved(name)`, `unsaved`, `scrollBack`, `scrollForward`, `menu(name)`, `moved(name, position, total)` |

`TabList`: `label`, `onReorder(values)` (reorderable tabs), `scrollable` (chevrons and wheel scrolling for many tabs), `trailing` (content after the last tab, such as a "New tab" IconButton). `Tab`: `value`, `icon`, `disabled`, `onClose` (closable tab), `dirty` (unsaved changes), `contextMenu` and `onCommand` (the tab's commands), `closeLabel` (the close button's name; by default `labels.close` with the tab's text, also when the label is not a plain string). `TabPanel`: `value`, `keepMounted` (keep hidden content mounted). Tabs without a `TabPanel` (e.g. routed content) are valid: they simply omit `aria-controls`.

- One Tab stop; arrows (RTL aware), Home and End; disabled tabs skipped; Tab moves to the panel.
- Removing the selected tab selects the one now in its place (or the previous one).
- **Document tabs.** `onClose` on a Tab adds a close button beside its label, and Delete (or Backspace) on the focused tab, or a middle-click on it, closes it (the middle press never starts the browser's autoscroll); the tab now in its place is selected and focused. The close button is for the pointer: it is out of the tab order and hidden from screen readers, which are told about Delete through `aria-keyshortcuts`. `onReorder` on the TabList lets people drag tabs along the list (through detent; on touch, hold briefly, so a swipe still scrolls) or press Ctrl+Shift (Cmd+Shift) with Left or Right; each move is announced.
- **Unsaved changes.** `dirty` puts a dot where the close button sits; while the tab is hovered or focused (selected or not) the dot gives way to the close button, whose name says the changes are unsaved (`labels.closeUnsaved`, "Close notes.md, unsaved changes"). Screen readers hear the state as the tab's description (`labels.unsaved`, "Unsaved changes"), so its name stays the document's. On touch, a tap focuses the tab and shows the close button.
- **Context menu.** `contextMenu` takes the same items as `Menu` and `ContextMenu` (items, or labelled sections), and `onCommand` gets the chosen item's `value`. Right-click, a long press on touch, Shift+F10 or the context menu key opens it (`aria-keyshortcuts` says so). The list hosts one ContextMenu beside the tablist, so even an open menu never sits inside the tablist. A command that removes the tab moves focus to the tab then selected, as Delete does; any other returns focus to the tab. The menu is named `labels.menu` with the tab's text ("notes.md actions").
- **Long labels** stop at `--cy-tabs-label-max-width` (default 20em) and end in an ellipsis; while a label is cut short, hovering or focusing the tab shows the whole text in a Tooltip. The tab's name always holds the whole text, so the tooltip is for the eye only (hidden from screen readers, no description).
- Overflowing lists scroll; edges with hidden tabs fade, and the selected or focused tab is scrolled clear of the fade.
- **`scrollable`** adds chevron IconButtons at each end while the tabs overflow, each shown only while there is more that way (RTL aware); a press scrolls most of the list's width. Like the close buttons they are for the pointer, out of the tab order and the accessibility tree: keyboard users move with the arrows, which scroll the focused tab into view. A vertical mouse wheel over the list scrolls it sideways (Ctrl+wheel stays the browser's zoom, and at either end the wheel scrolls the page).
- **`trailing`** content sits right after the last tab, outside the tablist (which may hold only tabs), and stays in view at the end when the tabs overflow. It comes after the tabs in the Tab order.

Tokens: `--cy-tabs-dirty` (the unsaved dot, default muted ink), `--cy-tabs-gap`, `--cy-tabs-indicator`, `--cy-tabs-indicator-width`, `--cy-tabs-label-max-width` (where a label is cut short, default 20em), `--cy-tabs-radius`.

**Printing:** a printout has every panel, in order. TabPanel renders the content of unselected panels while the page is printed (`beforeprint`), and the print stylesheet shows them.
