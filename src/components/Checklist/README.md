# Checklist

A list of rows people add, tick, rename and remove: a task's subtasks, a packing list, the steps of a recipe. Built from Checkbox (with `strikeWhenChecked`), TextField and IconButton, inside a Field that names the list. With `reorderable` the rows sit in a SortableList.

```tsx
import { Checklist, type ChecklistItem } from "@arshad-shah/cynosure";

const [subtasks, setSubtasks] = useState<ChecklistItem[]>([{ id: "1", label: "Buy milk", done: false }]);
<Checklist label="Subtasks" items={subtasks} onChange={setSubtasks} />;

// Or let it hold the rows itself:
<Checklist label="Packing list" defaultItems={[]} onChange={save} />;
```

| Prop                                  | Default | Notes                                                                                          |
| ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `label`                               | –       | What the rows are; names the group and the list, shown above the rows                          |
| `labelHidden`                         | `false` | Hides the label visually; it still names the list                                              |
| `items` / `defaultItems` / `onChange` | `[]`    | `{ id, label, done }`; `onChange` gets the full list after every change                        |
| `createId`                            | –       | Makes a new row's id. Default: `crypto.randomUUID()`, or a time-based id where that is missing |
| `maxItems`                            | –       | The add field and button turn off when the list is full                                        |
| `reorderable`                         | `false` | Rows get a grip: drag it, or Space then the arrow keys (SortableList)                          |
| `disabled`                            | `false` | Turns off every checkbox, field and button                                                     |
| `readOnly`                            | `false` | Only the rows: nothing can be ticked, added, renamed, removed or moved                         |
| `size`                                | `md`    | `sm` · `md`                                                                                    |
| `labels`                              | –       | `add` (field name and placeholder), `addButton`, `rename(name)`, `remove(name)`                |
| `className` / `style`                 | –       | Layout only. The ref points at the root element                                                |
- **Adding:** type in the add field and press Enter, or press the Add button. The name is trimmed, a blank name adds nothing, and focus stays in the field for the next row. When that row fills the list (`maxItems`), focus moves to the new row's checkbox.
- **Ticking:** each row is a Checkbox named by the row. Done rows are struck through and muted by Checkbox itself.
- **Renaming:** the Rename button turns the name into a field with the old name selected. Enter saves and Escape cancels, and both put focus back on the Rename button. Leaving the field (Tab, a press somewhere else) saves and leaves focus where it went. A blank name is not saved: the row keeps the name it had. Remove is the only way to delete a row.
- **Removing:** focus goes to the checkbox of the row that took its place, or the row before it, or the add field when no row is left.
- **Forms and dialogs:** Enter in either field never submits a form around the list, and Enter and Escape in the rename field do not reach a dialog around it. Enter is left alone while an input method is composing.
- **Read only:** the checkboxes stay focusable so the rows can be read, and a press leaves them as they were.
- **Names:** the group and the list carry `label`; the buttons read "Rename Buy milk" and "Remove Buy milk"; the grip reads "Move Buy milk".
- **Touch:** the buttons and the grip have 44px hit areas on coarse pointers, and each checkbox row is at least 44px tall.
- **Announcements:** like KeyValueEditor, adding, renaming and removing are not announced; focus moves to a named control instead. Moves made with `reorderable` are announced by SortableList.
- **Long names** wrap inside the row. Right-to-left layouts mirror the row.

## Tokens

- `--cy-checklist-gap`: space between rows, and between the rows and the add field
- `--cy-checklist-row-gap`: space between a row's checkbox, name and buttons

The checkbox, the strike, the fields, the buttons and the reorderable rows follow the Checkbox, TextField, Button and SortableList tokens.

## Used by

Planr: a task's subtasks, which are added, ticked, renamed in place and removed. This is the one essential use; any product with a list people write and work through uses it too.
