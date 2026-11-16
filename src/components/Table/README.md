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

| Prop                           | Default    | Notes                                                                                         |
| ------------------------------ | ---------- | --------------------------------------------------------------------------------------------- |
| `caption` / `captionHidden`    | – / false  | The table's name, shown above it (or only announced)                                          |
| `columns`                      | –          | `{ key, header, cell?, sortable?, sortValue?, align?, width?, rowHeader? }`                   |
| `rows` / `getRowId`            | –          | The data and a stable id per row                                                              |
| `sort` / `defaultSort`         | – / `null` | `{ key, direction: "ascending" \| "descending" }`; headers cycle ascending → descending → off |
| `onSortChange`                 | –          | Every sort change                                                                             |
| `manualSort`                   | `false`    | You sort the rows (a server); the table shows and reports the sort only                       |
| `selectable`                   | `false`    | A checkbox per row and a select-all (mixed when some are selected)                            |
| `selected` / `defaultSelected` | – / `[]`   | Selected row ids: those not in `rows` (another page, filtered out) first, then rows' order    |
| `onSelectionChange`            | –          | Every checkbox or select-all change, with the selected ids; select-all acts on shown rows     |
| `stickyHeader`                 | `false`    | Body scrolls inside the table (`--cy-table-max-height`); the scroller is a focusable region   |
| `size`                         | `md`       | Row density: `sm` · `md` · `lg`                                                               |
| `labels`                       | –          | `selectRow(rowName)`, `selectAll`, `empty`                                                    |
- Text sorts in the locale's order ignoring case and with numbers in order; numbers sort as numbers; empty values go last.
- The first column (or the one marked `rowHeader`) is a row header.
- Sort buttons are SortButtons: `aria-sort` on their header and a 44px hit area on touch screens.

## Written as markup

For fixed or hand-written rows, the compound form renders the same table with the same look:

```tsx
<Table caption="Invoice">
  <TableHead>
    <TableRow>
      <TableHeaderCell>Item</TableHeaderCell>
      <TableHeaderCell align="end">Price</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow selected>
      <TableHeaderCell>Hosting</TableHeaderCell>
      <TableCell align="end">12.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFoot>…</TableFoot>
</Table>;
```

| Part              | Element | Props                                                                                                          |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `Table`           | `table` | `caption`, `captionHidden`, `stickyHeader`, `size`, `children` (no `columns` / `rows`)                         |
| `TableHead`       | `thead` | –                                                                                                              |
| `TableBody`       | `tbody` | –                                                                                                              |
| `TableFoot`       | `tfoot` | A line above it (totals)                                                                                       |
| `TableRow`        | `tr`    | `selected` (body rows)                                                                                         |
| `TableHeaderCell` | `th`    | `scope` (default `col` in the head, `row` elsewhere), `align`, `width`, `colSpan`, `rowSpan`, `sort`, `onSort` |
| `TableCell`       | `td`    | `align`, `colSpan`, `rowSpan`                                                                                  |

Every part takes `id`, `data-*`, `className`, `style` and a `ref`. `onSort` makes the header a SortButton with `aria-sort` (you sort the rows); `sort` alone announces a sort made elsewhere. A part outside its place throws an error naming where it belongs.

## Tokens

- `--cy-table-header-background`, `--cy-table-selected-background`, `--cy-table-max-height`
