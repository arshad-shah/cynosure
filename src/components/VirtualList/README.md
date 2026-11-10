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

| Prop                                 | Default  | Notes                                                                    |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `label`                              | –        | Accessible name                                                          |
| `items`, `getKey`, `renderItem`      | –        | `renderItem(item, { index, selected, disabled })`; rows share one height |
| `selectionMode`                      | `single` | `none` (a list to act on) · `single` · `multiple`                        |
| `selectedKeys` / `onSelectionChange` | –        | Controlled; `defaultSelectedKeys` when uncontrolled                      |
| `onAction`                           | –        | Enter, a double-click, or a click when `selectionMode` is `none`         |
| `isDisabled`                         | –        | Disabled rows are skipped by the keys and cannot be chosen               |
| `empty`                              | –        | Shown when there are no items                                            |
| `size`                               | `md`     | `sm` · `md`                                                              |
| `className` / `style`                | –        | Layout only (`style={{ blockSize: … }}` sets the height)                 |
- Keys: arrows move, Page Up/Down move a screenful, Home and End jump, Space chooses, Enter acts (or chooses). With `multiple`, Shift+arrows extend and Ctrl/Cmd+A chooses all.
- The focused row is always rendered, so focus survives scrolling it far out of view; each row carries `aria-posinset` and `aria-setsize`.
- Row height comes from CSS (the `rowHeight` token, and 44px on touch screens) and is measured, never passed in.

## Tokens

- `--cy-virtual-list-height`, `--cy-virtual-list-row-height`, `--cy-virtual-list-selected-background`

## Used by

The tools app's file lists, page lists and history panels, and log and result lists in the web apps.
