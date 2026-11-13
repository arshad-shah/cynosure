# DataGrid

A read-only grid for large results (query results, table data): only the rows and columns in view are rendered, so a
hundred thousand rows by fifty columns scroll and move focus as quickly as twenty. It has a sticky header, sorting,
resizable columns, row, cell or range selection copied as tab-separated text, and the APG grid keyboard. For a short,
semantic table use `Table`.

```tsx
import { DataGrid, type DataGridColumn } from "@arshad-shah/cynosure";

const columns: DataGridColumn<Row>[] = fields.map((f) => ({
  key: f.name,
  header: f.name,
  sortable: true,
  resizable: true,
  minWidth: 80,
  align: f.numeric ? "end" : "start",
  cell: (row) => format(row[f.name]),
  tooltip: (row) => (isCut(row[f.name]) ? fullText(row[f.name]) : null),
  cellKind: (row) => (row[f.name] === null ? "null" : typeof row[f.name] === "number" ? "number" : undefined),
}));

<DataGrid
  label="Results"
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id}
  size="sm"
  selectionMode="range"
  onRowClick={(row) => inspect(row)}
  onEndReached={loadMore}
/>;
```

| Prop                                                               | Default  | Notes                                                                                                                                  |
| ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                                                            | –        | Accessible name of the grid                                                                                                            |
| `columns`                                                          | –        | `key`, `header`, `width`, `minWidth`, `maxWidth`, `align`, `sortable`, `resizable`, `cell`, `value`, `tooltip`, `cellKind`, `cellTone` |
| `rows`, `getRowId`                                                 | –        | The data and a stable id per row                                                                                                       |
| `sort` / `defaultSort` / `onSortChange`                            | unsorted | `TableSort` (`{ key, direction }`), shared with `Table`; `null` is unsorted                                                            |
| `manualSort`                                                       | `false`  | You sort the rows (on a server); the grid shows and reports the sort                                                                   |
| `onColumnResize`                                                   | –        | `(key, width)` after a drag of the header's edge or Alt+Left/Right on the header                                                       |
| `selectionMode`                                                    | `none`   | `none` · `row` · `cell` · `range`                                                                                                      |
| `selected` / `defaultSelected` / `onSelectionChange`               | `[]`     | Row ids, with `selectionMode="row"`                                                                                                    |
| `selectedRange` / `defaultSelectedRange` / `onSelectedRangeChange` | `null`   | `{ anchor, focus }`, each `{ rowId, key }`, with `cell` or `range`                                                                     |
| `onRowClick`                                                       | –        | A cell of the row was clicked or tapped                                                                                                |
| `onAction`                                                         | –        | Enter on a cell, or a double-click                                                                                                     |
| `onEndReached`                                                     | –        | The last rows came into view (once per row count): append the next rows                                                                |
| `size`                                                             | `md`     | `sm` is dense (28px rows under a 32px header)                                                                                          |
| `labels`                                                           | –        | `empty`: the message when there are no rows                                                                                            |
| `className` / `style`                                              | –        | Layout only (`blockSize` sets the height)                                                                                              |

Columns: `width` is in CSS pixels (default 160; a new value replaces a width the user dragged). `cell` formats the
value (default: the value as text); `value` is the raw value sorting compares and copying writes (default `row[key]`).
`tooltip` returns the full value of a cell cut short (shown in a `Tooltip`, never `title`), or nothing. `cellKind`
marks what a cell holds: `"null"` (muted, italic) or `"number"` (the number colour). `cellTone` colours a cell with a
tone (`accent`, `neutral`, `danger`, `success`, `warning`, `info`), over the kind's colour.

Paging is not built in: put a `Pagination` under the grid and give the grid one page of rows. For "load more", append
rows in `onEndReached`.

## Behaviour

- **Keyboard** (APG grid): one tab stop. Arrows move between cells (Left and Right follow the reading direction), Up
  from the first row reaches the header; Home and End go to the row's ends, Ctrl+Home and Ctrl+End to the first and
  last cells; Page Up and Page Down move a view of rows (Page Up from the first row reaches the header). The focused cell is scrolled into view, and stays rendered
  when scrolled away. Enter on a cell calls `onAction` ; on a sortable header it sorts.
- **Selection**: `row`: click selects a row, Ctrl/Cmd+click toggles, Shift+click, Shift+Up/Down and Shift+Space extend,
  Space selects the focused row, Ctrl/Cmd+Space toggles it, Ctrl/Cmd+A selects all. `cell`: the focused cell is selected. `range`: arrows select the
  focused cell, Shift+click and Shift+arrows extend the rectangle, Ctrl/Cmd+A selects every cell. With any selection mode,
  Shift+click selects cells, never text.
- **Copy**: Ctrl/Cmd+C writes the selection as tab-separated text (rows on lines; a value holding a tab, a line break
  or a quote is quoted). Text selected by dragging inside cells copies as text instead: dragging selects text, while
  Shift+click and Shift+arrows select cells, so both work.
- **Resize**: drag a header's edge (mouse, pen or finger; Escape cancels), or press Alt+Left/Right on the header
  (Shift for a bigger step; `aria-keyshortcuts` announces it). `minWidth` and `maxWidth` bound it.
- **Touch**: a finger scrolls the grid and a tap acts like a click. Rows and the header are at least 44px tall on a
  coarse pointer, and a header's edge has a 44px hit area.

## Tokens

- `--cy-data-grid-height`: Height of the grid (it scrolls inside, in both directions).
- `--cy-data-grid-row-height`: Height of a row (never less than the hit area: 44px on a touch screen).
- `--cy-data-grid-header-height`: Height of the header row.
- `--cy-data-grid-header-background`: Background of the header row.
- `--cy-data-grid-selected-background`: Background of selected rows and cells.
- `--cy-data-grid-cell-padding`: Inline padding of a cell.
- `--cy-data-grid-null-color`: Text colour of cells whose cellKind is "null" (an empty value).
- `--cy-data-grid-number-color`: Text colour of cells whose cellKind is "number".
