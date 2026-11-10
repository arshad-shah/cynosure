# Tree

A hierarchical list (WAI-ARIA APG tree view): folders and files, a JSON or DOM tree, nested settings. Keyboard, type-ahead, single or multiple selection, children loaded on demand, and a virtual mode for very large trees.

```tsx
<Tree label="Files" items={files} defaultExpanded={["src"]} onSelectionChange={open} />
<Tree label="Remote" items={roots} loadChildren={(item) => api.list(item.id)} />
<Tree label="Document" items={nodes} virtual style={{ blockSize: 480 }} renderLabel={(n) => <Value node={n} />} />
```

| Prop                                                 | Default  | Notes                                                                           |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `label`                                              | –        | Accessible name of the tree                                                     |
| `items`                                              | –        | `{ id, label, icon?, disabled?, children?, hasChildren? }[]`                    |
| `selected` / `defaultSelected` / `onSelectionChange` | `[]`     | Selected ids                                                                    |
| `expanded` / `defaultExpanded` / `onExpandedChange`  | `[]`     | Expanded ids                                                                    |
| `selectionMode`                                      | `single` | `multiple`: Space and Ctrl/Cmd-click toggle; Enter and a plain click select one |
| `loadChildren`                                       | –        | `(item) => Promise<TreeItem[]>` for items with `hasChildren` and no `children`  |
| `renderLabel`                                        | –        | Custom row content; `label` still drives type-ahead                             |
| `virtual`                                            | `false`  | Render only rows in view; give the tree a height; rows share one height         |
| `size`                                               | `md`     | Row height and indent                                                           |
| `labels`                                             | –        | `loading`, `failed` (the retry row)                                             |
- One Tab stop (roving tabindex). Up/Down, Home/End, Right opens or enters, Left closes or goes to the parent (swapped in RTL), `*` opens all siblings, type-ahead by label. Disabled and loading rows are skipped and never take focus.
- Rows are a flat list with `aria-level`, `aria-posinset` and `aria-setsize`; only expanded branches are rendered, and rows are memoised so moving focus re-renders two rows.
- A failed `loadChildren` shows a row that retries with Enter or a click.

Tokens: `--cy-tree-indent`, `--cy-tree-row-height`, `--cy-tree-selected-bg`.

- `onAction(item)`: Enter or a double-click runs an item's default action (open it, copy its path); Space still selects.
- A `selected` value changed from outside (search next/previous) moves the tab stop to that item and scrolls it into view, even in a virtual tree, without taking focus from where the person is. Its ancestors must be expanded.

## Used by

Prism (the JSON and XML document tree: `src/ui/VirtualTree.tsx`, virtual with custom rows), aperture-css (DOM tree panel), verql (schema browser).
