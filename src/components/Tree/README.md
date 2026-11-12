# Tree

A hierarchical list (WAI-ARIA APG tree view): folders and files, a database schema, a JSON or DOM tree, nested settings. Keyboard, type-ahead, single or multiple selection, children loaded on demand (by the tree or by your store), groups, row actions and context menus, filtering with marked matches, and a virtual mode for very large trees.

```tsx
<Tree label="Files" items={files} defaultExpanded={["src"]} onSelectionChange={open} />
<Tree label="Remote" items={roots} loadChildren={(item) => api.list(item.id)} handle={treeRef} />
<Tree label="Document" items={nodes} virtual style={{ blockSize: 480 }} renderLabel={(n) => <Value node={n} />} />
<Tree<SchemaObject>
  label="Schema"
  items={[{ id: "tables", label: "Tables", kind: "group", children: tables.map(toItem) }]}
  filter={search}
  loadingIds={store.loading}
  errorIds={store.failed}
  onRetry={(item) => store.fetchColumns(item.data)}
  renderEmpty={(item) => `No columns in ${item.label}`}
  onCommand={(command, item) => run(command, item.data)}
/>
```

| Prop                                                 | Default  | Notes                                                                                          |
| ---------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `label`                                              | –        | Accessible name of the tree                                                                    |
| `items`                                              | –        | `TreeItem<T>[]` (below)                                                                        |
| `selected` / `defaultSelected` / `onSelectionChange` | `[]`     | Selected ids                                                                                   |
| `expanded` / `defaultExpanded` / `onExpandedChange`  | `[]`     | Expanded ids                                                                                   |
| `selectionMode`                                      | `single` | `multiple`: Space and Ctrl/Cmd-click toggle; Enter and a plain click select one                |
| `loadChildren`                                       | –        | `(item) => Promise<TreeItem[]>` for items with `hasChildren` and no `children`                 |
| `loadingIds` / `errorIds`                            | –        | Loading and failure driven by your store: a loading row, or an error row in place of children  |
| `onRetry`                                            | –        | `(item)`: a failed item is retried (Enter or a click on its error row)                         |
| `renderError` / `renderEmpty`                        | –        | `(item, retry)` / `(item)`: content of the error row, and of a row under an empty open item    |
| `filter`                                             | –        | A string, or `(item) => boolean \| positions`: matches, their ancestors (opened), marked text  |
| `renderLabel`                                        | –        | `(item, label)`: custom row content; `label` has the matches marked; `label` drives type-ahead |
| `onAction`                                           | –        | `(item)`: Enter or a double-click                                                              |
| `onCommand`                                          | –        | `(value, item)`: a row action pressed or a context menu command chosen                         |
| `handle`                                             | –        | `Ref<TreeHandle>`: `reload(id)` runs `loadChildren` again                                      |
| `virtual`                                            | `false`  | Render only rows in view; give the tree a height; rows share one height                        |
| `size`                                               | `md`     | Row height and indent                                                                          |
| `labels`                                             | –        | `loading`, `failed` (the retry row), `menu(label)` (a row's context menu name)                 |

`TreeItem<T>`: `id`, `label`, `icon`, `iconTone`/`iconColor`, `disabled`, `children`, `hasChildren`, `kind` (`"group"`: a heading row that opens and closes, never selected, ending with its child count), `trailing` (a count or badge at the row's end, part of its name), `data` (your payload, handed back in every callback), `actions` (`{ value, label, icon }[]`, IconButtons at the row's end) and `contextMenu` (`MenuEntry[]`).

## Behaviour and accessibility

- One Tab stop (roving tabindex). Up/Down, Home/End, Right opens or enters, Left closes or goes to the parent (swapped in RTL), `*` opens all siblings, type-ahead by label. Disabled and loading rows are skipped and never take focus.
- Rows are a flat list with `aria-level`, `aria-posinset` and `aria-setsize`; only expanded branches are rendered, and rows are memoised so moving focus re-renders two rows.
- A failed `loadChildren` (or an id in `errorIds`) shows a row that retries with Enter or a click. A press on a button inside the row (your `renderError`'s retry button) is that button's alone. Keep such buttons out of the Tab order (`tabIndex={-1}`): Enter on the row does the same.
- **Row actions** show while the row is hovered, focused or selected (always on screens without hover). Keyboard: they are in the Tab order on the focused row only, right after it, so Tab reaches them and Shift+Tab or Escape goes back; arrows still move between rows from them. The APG tree keys are untouched, the tree keeps one way in, and screen readers hear the buttons by name. A row with actions is named by its label and trailing text (`aria-labelledby`), not by its buttons.
- **Context menu:** right-click, a long press, Shift+F10 or the context menu key on a row opens one ContextMenu hosted beside the tree (a tree holds only tree items); focus returns to the row.
- **Filter:** matches show with their ancestors opened (the `expanded` ids are not changed) and everything under them; other rows are hidden; matched text is marked with HighlightedText. An opened ancestor can still be closed. Only known children are searched.
- `onAction(item)`: Enter or a double-click runs an item's default action (open it, copy its path); Space still selects.
- A `selected` value changed from outside (search next/previous) moves the tab stop to that item and scrolls it into view, even in a virtual tree, without taking focus from where the person is. Its ancestors must be expanded.

## Tokens

- `--cy-tree-indent`, `--cy-tree-row-height`, `--cy-tree-selected-bg`
- `--cy-tree-trailing-ink`: colour of a row's trailing text or count
- `--cy-tree-group-ink`: text colour of a group row
