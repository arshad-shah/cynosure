---
"@arshad-shah/cynosure": minor
---

Table: a compound form for rows written as markup, next to the data-driven one and with the same stylesheet and look: `<Table caption>` with `TableHead`, `TableBody`, `TableFoot`, `TableRow` (`selected`), `TableHeaderCell` (a column header in the head and a row header elsewhere, `scope` to override; `align`, `width`, `colSpan`, `rowSpan`, and `sort` with `onSort` for a SortButton header with `aria-sort`) and `TableCell` (`align`, `colSpan`, `rowSpan`). `caption`, `captionHidden`, `stickyHeader` and `size` work in both forms; the foot is set apart by a line above it. Every part takes `id`, `data-*`, `className`, `style` and a `ref`, and throws when used outside its place. Both forms now pass `id` and `data-*` to the root.
