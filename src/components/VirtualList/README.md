# VirtualList

A long list (thousands of rows) that renders only the rows in view: logs, file lists, search results, history. An APG listbox with one tab stop, single or multiple selection, and an action on Enter or double-click.

```tsx
import { VirtualList } from "@arshad-shah/cynosure";

<VirtualList
  label="Files"
  items={files}
  getKey={(file) => file.id}
  renderItem={(file) => file.name}
  selectionMode="multiple"
  selectedKeys={chosen}
  onSelectionChange={setChosen}
  onAction={(file) => open(file)}
/>;
```

| Prop                                 | Default  | Notes                                                                           |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------- |
| `label`                              | –        | Accessible name                                                                 |
| `items`, `getKey`, `renderItem`      | –        | `renderItem(item, { index, selected, disabled })`                               |
| `wrap`                               | `false`  | Rows wrap and take the height they need; each is measured as it renders         |
| `follow`                             | `false`  | Stays at the end as rows arrive, while scrolled there (logs, feeds)             |
| `onAtBottomChange`                   | –        | `false` when the view leaves the end, `true` when it is back. Starts `true`     |
| `overlay`                            | –        | Pinned at the bottom centre over the list, outside the listbox; does not scroll |
| `isHeader`                           | –        | Section headings: not focusable or selectable; the current one is pinned        |
| `handle`                             | –        | A ref to `{ scrollToIndex(index, align?), scrollToEnd() }`                      |
| `selectionMode`                      | `single` | `none` (a list to act on) · `single` · `multiple`                               |
| `selectedKeys` / `onSelectionChange` | –        | Controlled; `defaultSelectedKeys` when uncontrolled                             |
| `onAction`                           | –        | Enter, a double-click, or a click when `selectionMode` is `none`                |
| `isDisabled`                         | –        | Disabled rows are skipped by the keys and cannot be chosen                      |
| `empty`                              | –        | Shown when there are no items                                                   |
| `size`                               | `md`     | `sm` · `md`                                                                     |
| `className` / `style`                | –        | Layout only (`style={{ blockSize: … }}` sets the height)                        |
- Keys: arrows move, Page Up/Down move a screenful, Home and End jump, Space chooses, Enter acts (or chooses). With `multiple`, Shift+arrows extend and Ctrl/Cmd+A chooses all.
- With `onMove`, Alt+Up/Down moves the selection (or the focused row) one place, and a mouse or pen drags it; a line shows where it will land, the list scrolls near its edges, and Escape cancels. Chosen rows move together and close up. A finger scrolls the list as usual. Moves are announced.
- The focused row is always rendered, so focus survives scrolling it far out of view; each row carries `aria-posinset` and `aria-setsize`.
- Row height comes from CSS (the `rowHeight` token, and 44px on touch screens) and is measured, never passed in. With `wrap`, every row is measured, and rows not yet seen are guessed at one line, so the scrollbar settles as you scroll.
- `follow` is for logs: while the list is scrolled to its end, new rows keep it there; scroll up to read and it stays put until you return (or call `scrollToEnd`). The list stays a listbox rather than `role="log"`, which would read every new line aloud; announce what matters with your own status message.
- `onAtBottomChange` and `overlay` make a "3 new" pill: count what arrives while `atBottom` is false, show it in `overlay`, and call `handle.scrollToEnd()` from it. Following is shared with ScrollArea (`useFollow` in `src/foundations/use-follow.ts`). The list always sits in an [OverlayFrame](../OverlayFrame/README.md) as wide as its parent, so the overlay can come and go without remounting the list.
- `isHeader` rows are announced as dimmed options, in reading order, and the keys step over them. A copy of the current heading is pinned at the top (hidden from screen readers, which already have the real one).

## Tokens

- `--cy-virtual-list-height`, `--cy-virtual-list-row-height`, `--cy-virtual-list-selected-background`
- The overlay is placed by OverlayFrame: `--cy-overlay-frame-offset` (space between the bottom edge and the overlay, default `--cy-space-4`) and `--cy-overlay-frame-layer`, set on an element around the list
