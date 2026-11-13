# RowActions

The buttons at the end of a row (a list entry, a tree item, a message): hidden with a mouse until the row is hovered or holds focus or a menu of theirs is open, always shown on touch screens, and in the Tab order only on the row that holds the Tab stop. ListRow, Tree and ChatMessage render their `actions` with it.

```tsx
import { IconButton, RowActions } from "@arshad-shah/cynosure";

<li>
  <Button ref={main}>report.pdf</Button>
  <RowActions tabbable={main}>
    <IconButton icon={trash} label="Delete" variant="ghost" size="sm" />
  </RowActions>
</li>;
```

| Prop                  | Default | Notes                                                                                                                 |
| --------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `children`            | –       | IconButtons, a Menu, a Toolbar of them                                                                                |
| `tabbable`            | –       | A ref to the row's control (in the Tab order while it is the Tab stop), `true` or `false`; left out, tabindex is kept |
| `shown`               | `false` | Shown whatever the pointer does (a selected row)                                                                      |
| `className` / `style` | –       | Layout only (its place in the row)                                                                                    |

## The reveal rule

One rule for every row: `(hover: hover)` hides them by opacity (in place and still focusable); they show while their parent (the row), or an ancestor marked `data-row-actions-host` (ChatMessage's whole message), is hovered or holds focus, while focus or an open menu (`aria-expanded="true"`) is inside them, or with `shown`. Without hover they are always shown.

## Keyboard models

ListRow and Tree are lists with roving focus, so a row's actions follow its Tab stop (`tabbable` with the row's control, or Tree's focused row): Tab from the row reaches them. ChatMessage's messages are not a roving list, so its actions are always in the Tab order, grouped in a Toolbar (one stop, arrows between). Tabs' close button is not a RowActions: it is for the pointer only (Delete closes the tab), outside the Tab order and the accessibility tree, and shares its place with the unsaved dot.

## Tokens

- `--cy-row-actions-gap`: space between the controls
- `--cy-row-actions-background`: fill behind them, for actions drawn over a row
