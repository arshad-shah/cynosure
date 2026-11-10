# SortableList

A list people put in order: drag a row by its handle with a mouse, pen or finger, or focus the handle, press Space and move it with the arrow keys. Every step is announced.

```tsx
import { SortableList } from "@arshad-shah/cynosure";

<SortableList label="Sidebar order" items={sections} onReorder={setSections} />;
// items: { id, label, content? }[]
```

| Prop                     | Default  | Notes                                                                                                        |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `label`                  | –        | Accessible name of the list                                                                                  |
| `items` / `defaultItems` | – / `[]` | `{ id, label, content? }`: `label` is plain text for announcements; `content` is what shows                  |
| `onReorder`              | –        | Called with the items in their new order when a move is dropped (not while it is moving)                     |
| `disabled`               | `false`  | Handles are disabled                                                                                         |
| `size`                   | `md`     | `sm` · `md` · `lg`                                                                                           |
| `labels`                 | –        | `handle(label)`, `instructions`, `pickedUp`, `moved`, `dropped` (label, position, total), `cancelled(label)` |
- Keyboard: Space or Enter picks a row up and drops it; Arrow Up/Down move it; Home/End move it to the ends; Escape cancels and puts it back; Tab drops it where it is.
- Each handle is a "Move …" button described by the instructions; `aria-pressed` shows the row being moved; picks, moves, drops and cancels are announced politely.
- Dragging swaps rows as the pointer passes a neighbour's middle; touch dragging does not scroll the page; handles have a 44px hit area on touch screens.

## Tokens

- `--cy-sortable-list-item-background`, `--cy-sortable-list-radius`

## Used by

Ordering sidebar sections, favourites, steps and priorities in the web apps and extensions (cross-product audit, 2026-11-10).
