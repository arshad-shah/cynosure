# ListRow

Interactive rows for app lists: notifications, an activity feed, saved queries, query history, connections, a list of charts. `ListRows` is the list; each `ListRow` has a leading slot, a title with up to two quieter lines (one may be monospace), a trailing slot, and actions shown on hover or focus. A row with `onClick` is a button, with `href` a link; its actions are siblings of that control, never inside it.

For a static bulleted, numbered or ticked list use `List`; for choosing a value use `Select` or `RadioGroup`; for a hierarchy use `Tree`; for thousands of rows use `VirtualList`.

```tsx
import { Badge, IconButton, IconTile, ListRow, ListRows } from "@arshad-shah/cynosure";
import { alert, play, trash } from "@arshad-shah/cynosure/icons";

<ListRows label="Notifications" divided>
  <ListRow
    label="Query failed on orders"
    description='relation "orders_archive" does not exist'
    detail="SELECT * FROM orders_archive"
    mono="detail"
    leading={<IconTile icon={alert} size="sm" tone="danger" />}
    trailing="2m"
    tone="danger"
    unread
    onClick={() => open(id)}
    actions={
      <>
        <IconButton icon={play} label="Run again" size="sm" variant="ghost" onClick={rerun} />
        <IconButton icon={trash} label="Dismiss" size="sm" variant="ghost" onClick={dismiss} />
      </>
    }
  />
</ListRows>;
```

## ListRows

| Prop                  | Default | Notes                                                 |
| --------------------- | ------- | ----------------------------------------------------- |
| `label`               | –       | Names the list ("Notifications") when no heading does |
| `size`                | `md`    | `sm` · `md` · `lg`: text size and row padding         |
| `divided`             | `false` | A line between rows                                   |
| `labels`              | English | `unread`, `danger`, `warning`, `success`, `info`      |
| `className` / `style` | –       | Layout only                                           |

## ListRow

| Prop                     | Default | Notes                                                                                     |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `label`                  | –       | The title; names the row's button or link. One line with an ellipsis unless `wrap`        |
| `description` / `detail` | –       | Up to two quieter lines under the title                                                   |
| `mono`                   | –       | `"description"` or `"detail"`: that line in the monospace font                            |
| `leading`                | –       | An `IconTile`, `Avatar`, `Icon` or `Badge` status dot                                     |
| `trailing`               | –       | A time, a count, a `Badge`: content, never a control                                      |
| `actions`                | –       | `IconButton`s or a `Menu`, shown on hover or focus, always shown on touch                 |
| `active`                 | `false` | Accent rail on the inline start and a tint; `aria-current` (`page` for a link)            |
| `unread`                 | `false` | Bold title and an accent dot; "Unread" is read after the title                            |
| `dimmed`                 | `false` | Muted title and a grey leading slot                                                       |
| `tone`                   | –       | A rail and a faint wash in the tone's colour; its word ("Error") is read before the title |
| `wrap`                   | `false` | The title wraps instead of being cut                                                      |
| `onClick` / `href`       | –       | Makes the row a button or a link (`href` wins; unsafe schemes are not linked)             |
| `className` / `style`    | –       | Layout only                                                                               |

## Keyboard, focus and touch

- The list is one Tab stop: the `active` row, else the first clickable row, else the row used last.
- Up and Down move between clickable rows (no wrap), Home and End jump to the first and last.
- Enter or Space presses a button row; Enter follows a link row.
- Right (Left in RTL) moves from a row into its actions and along them; Left moves back.
- Tab from a row reaches that row's actions, then leaves the list; other rows' actions are reached with the arrows. A row that cannot be pressed keeps its actions in the Tab order.
- The row's button holds only its title, with its hit area stretched over the whole row, so it is named by the title (with the tone's word and "Unread") and described by the leading slot, the meta lines and the trailing slot.
- Where there is hover, the actions are drawn over the end of the row while it is hovered or has focus, and stay while a menu opened from them is open. Where there is none (touch), they take their own place at the end and are always shown. Rows are at least 24px tall, 44px on a coarse pointer.

## Tokens

- `--cy-list-row-background`: The row's background at rest: the colour of the surface the list sits on (actions are drawn over it).
- `--cy-list-row-padding-inline`: Padding at the row's inline start and end.
- `--cy-list-row-rail-width`: Width of the edge rail of an `active` or toned row.
- `--cy-list-row-hover-mix`: How much ink is mixed into a clickable row's background on hover (a percentage).
- `--cy-list-row-active-mix`: How much of the accent is mixed into an `active` row's background (a percentage).
- `--cy-list-row-wash-mix`: How much of the tone is mixed into a toned row's background, the faint wash (a percentage).
- `--cy-list-row-meta-color`: Colour of the description, the detail and the trailing slot.
- `--cy-list-row-dimmed-filter`: CSS filter on the leading slot of a `dimmed` row (it stays readable: nothing is faded).
- `--cy-list-row-divider-color`: Colour of the line between rows with `divided`.
- `--cy-list-row-gap`: Space between the leading slot, the text, the trailing slot and the actions.
