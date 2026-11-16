---
"@arshad-shah/cynosure": minor
---

DataGrid is no longer read-only, keeping the APG grid keyboard and virtualisation:

- **Cell editing:** a column's `editable` (or `(row) => boolean`) and `editor` (`text`, `number`, or `select` with `options`); Enter or F2 edits the focused cell, typing a character starts with it, a double-click edits; Enter commits, Tab commits and moves on, Escape cancels, leaving the cell commits. `onCellEdit(row, key, value)` gets a string, a number (or null), or the option's value; text that is no number is refused (`labels.invalidNumber`).
- **Multi-column sort:** `multiSort` with `sorts` / `defaultSorts` / `onSortsChange`; Shift+click or Shift+Enter adds a column as the next key, turns it, then removes it; sorted headers show their priority (SortButton `rank`). `onSortChange` still reports the first key.
- **Column filters:** a column's `filter` (`text`, `number` with `>30`, `<=40`, `30..40`, or `(row, query) => boolean`) adds its field to a filter row under the header; `filters` / `defaultFilters` / `onFiltersChange`, `manualFilter`.
- **Column menu:** `columnMenu` puts a menu on each header (its button, Alt+Down, Shift+F10) to sort, move the column left or right, hide it, and show hidden columns from a Columns submenu; `columnOrder` / `onColumnOrderChange` and `hiddenColumns` / `onHiddenColumnsChange`, controlled or not.
- **Row details:** `renderRowDetails(row)` adds a toggle column (click, Enter or Space) that opens a panel under the row, measured, with the rows below moving down; `expandedRows` / `defaultExpandedRows` / `onExpandedRowsChange`.

Columns take `label`, their plain-text name for the editor, filter and menu. New labels and token `--cy-data-grid-details-background`.
