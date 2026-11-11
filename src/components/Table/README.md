# Table

Rows of data with headers: sortable columns, optional row selection, a sticky header and an empty state. A native `<table>`, so screen readers announce the column and row headers with every cell.

```tsx
import { Table } from "@arshad-shah/cynosure";

<Table
  caption="Team members"
  rows={members}
  getRowId={(m) => m.id}
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "role", header: "Role", cell: (m) => <Badge>{m.role}</Badge> },
    { key: "seats", header: "Seats", sortable: true, align: "end" },
  ]}
  selectable
  onSelectionChange={setSelected}
/>;
```

| Prop                           | Default    | Notes                                                                                       |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------- |
| `caption` / `captionHidden`    | – / false  | The table's name, shown above it (or only announced)                                        |
| `columns`                      | –          | `{ key, header, cell?, sortable?, sortValue?, align?, width?, rowHeader? }`                 |
| `rows` / `getRowId`            | –          | The data and a stable id per row                                                            |
| `sort` / `defaultSort`         | – / `null` | `{ key, direction: "ascending"                                                              | "descending" }`; headers cycle ascending → descending → off |
| `onSortChange`                 | –          | Every sort change                                                                           |
| `manualSort`                   | `false`    | You sort the rows (a server); the table shows and reports the sort only                     |
| `selectable`                   | `false`    | A checkbox per row and a select-all (mixed when some are selected)                          |
| `selected` / `defaultSelected` | – / `[]`   | Selected row ids, reported in the rows' order                                               |
| `stickyHeader`                 | `false`    | Body scrolls inside the table (`--cy-table-max-height`); the scroller is a focusable region |
| `size`                         | `md`       | Row density: `sm` · `md` · `lg`                                                             |
| `labels`                       | –          | `selectRow(rowName)`, `selectAll`, `empty`                                                  |
- Text sorts in the locale's order ignoring case and with numbers in order; numbers sort as numbers; empty values go last.
- The first column (or the one marked `rowHeader`) is a row header.
- Sort buttons have `aria-sort` on their header and a 44px hit area on touch screens.

## Tokens

- `--cy-table-header-background`, `--cy-table-selected-background`, `--cy-table-max-height`

## Used by

Member lists, history and log views, and settings tables in the web apps and extensions (cross-product audit, 2026-11-10).
