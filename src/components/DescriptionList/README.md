# DescriptionList

Term and detail pairs: a settings summary, a record's metadata, the facts on a review screen. Terms sit beside their details when there is room and above them when the list is narrow.

```tsx
import { DescriptionList } from "@arshad-shah/cynosure";

<DescriptionList
  items={[
    { term: "Name", detail: "Ada Lovelace" },
    { term: "Role", detail: <Badge tone="accent">Owner</Badge> },
    { term: "Teams", detail: ["Engines", "Notes"] },
  ]}
  divided
/>;
```

| Prop                  | Default | Notes                                                                                         |
| --------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `items`               | –       | `{ term, detail, id? }`; `detail` can be an array; `id` is needed when `term` is not a string |
| `layout`              | `auto`  | `auto` (inline from 28rem of the list's own width, stacked below) · `inline` · `stacked`      |
| `divided`             | `false` | Lines between rows                                                                            |
| `size`                | `md`    | `sm` · `md` · `lg`                                                                            |
| `className` / `style` | –       | Layout only                                                                                   |
- A native `<dl>`: screen readers announce terms and their definitions.
- Inline terms share one column, no wider than `--cy-description-list-term-width` (40%); long terms wrap inside it.
- `auto` responds to the list's width, not the window's, so it works in side panels and popups.

## Tokens

- `--cy-description-list-term-width`: widest the term column gets (default 40%)
- `--cy-description-list-column-gap`: space between terms and details
- `--cy-description-list-row-gap`: space between rows

## Used by

Settings summaries, record details and review screens in the web apps and extensions (cross-product audit, 2026-11-10).
