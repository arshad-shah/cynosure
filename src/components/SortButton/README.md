# SortButton

The button in a sortable column's header: the header text and an icon that shows the sort (both ways when unsorted, an arrow up or down when sorted). Table and DataGrid render it for their `sortable` columns, so both look and behave the same; use it directly only for a table of your own. The header cell carries `aria-sort`; the button only changes the sort.

```tsx
import { SortButton } from "@arshad-shah/cynosure";

<th aria-sort={sort?.key === "name" ? sort.direction : "none"}>
  <SortButton direction={sort?.key === "name" ? sort.direction : undefined} onClick={() => cycleSort("name")}>
    Name
  </SortButton>
</th>;
```

| Prop                                         | Default | Notes                                                                               |
| -------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `children`                                   | –       | The header text; cut short with an ellipsis in a narrow column                      |
| `direction`                                  | –       | `ascending` · `descending`; nothing when unsorted                                   |
| `onClick`                                    | –       | Change the sort                                                                     |
| `fill`                                       | `false` | Fill the header cell (a grid's fixed-height header); otherwise as wide as the label |
| `align`                                      | `start` | `end` (numeric columns) puts the icon before the label                              |
| `tabIndex`, `aria-keyshortcuts`, `data-cell` | –       | For a grid's one-tab-stop keyboard navigation                                       |
| `className`                                  | –       | Layout only                                                                         |

Enter and Space press it. The hit area is at least 24px, 44px on touch screens (a filling button takes its cell's height). A sorted column's button is drawn in the ink colour; an unsorted one takes the header's colour. Filling a cell, its focus ring is drawn inside the cell.

## Tokens

- `--cy-sort-button-padding`: inline padding when it fills its cell (default `--cy-space-4`; DataGrid sets its cell padding)
