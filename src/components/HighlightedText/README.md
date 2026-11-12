# HighlightedText

Text with the parts that matched a search marked: the characters a fuzzy matcher returned (`positions`), or every occurrence of a `query`, ignoring case. Tree, Combobox and CommandPalette mark their matches with it; use it in your own result lists too.

```tsx
import { HighlightedText } from "@arshad-shah/cynosure";

<HighlightedText text="customer_orders" query="order" />
<HighlightedText text="customer_orders" positions={fuzzy.positions} />
```

| Prop                  | Default | Notes                                                                      |
| --------------------- | ------- | -------------------------------------------------------------------------- |
| `text`                | –       | The text to show                                                           |
| `positions`           | –       | Indices of matched characters (UTF-16, as fuzzy matchers return); wins     |
| `query`               | –       | A term or several terms; every occurrence of each is marked, ignoring case |
| `className` / `style` | –       | Layout only                                                                |

## Accessibility

The text is in the page once, with matched runs in `<mark>`. An option or tree row named by its content is named by the whole text, and screen readers read that name when it takes focus, with no "highlighted" between the pieces. In a reading mode NVDA and JAWS may say "highlighted" at a mark, which is what it means here. No hidden second copy: find-in-page, copying and `textContent` see the text once. With nothing matched, the text is one plain text node.

In forced colours the marks use the system's `Mark` and `MarkText` colours and are underlined.

## Tokens

- `--cy-highlighted-text-radius`: corner radius of a matched run
- `--cy-highlighted-text-weight`: font weight of a matched run
- `--cy-highlighted-text-ink`: text colour of a matched run
- `--cy-highlighted-text-highlight`: background of a matched run (default: the accent at 28% over transparent)
