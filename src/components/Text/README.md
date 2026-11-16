# Text

One piece of text in Cynosure's type scale: labels, captions, lead paragraphs, helper lines and values. It is for everything that is not long-form content (`Prose`) and not a heading (`Heading`), so products do not write their own type classes.

```tsx
import { Text } from "@arshad-shah/cynosure";

<Text>Last saved 2 minutes ago</Text>                      // span · body · md · surrounding colour
<Text as="p" variant="lead">Everything that changed this month.</Text>
<Text variant="eyebrow">Release notes</Text>
<Text variant="caption" tone="danger">Could not save</Text>
<Text numeric weight="bold" size="xl">1,284.50</Text>
<Text as="div" numeric weight="bold" size="5xl">24:59</Text>      // a countdown, inside role="timer"
<Text as="p" truncate={2}>{description}</Text>
<Text as="time" dateTime="2026-03-12" variant="caption">12 March</Text>
```

| Prop                                    | Default   | Notes                                                                                                                                                     |
| --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                                    | `span`    | `span`, `p`, `div`, `label`, `strong`, `em`, `small`, `time`, `figcaption`                                                                                |
| `variant`                               | `body`    | `lead` (larger, muted), `caption` (small, muted), `eyebrow` (small, uppercase, tracked, mono), `code` (mono)                                              |
| `size`                                  | variant's | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`: the `--cy-font-size-*` tokens. Body and code are `md`. `3xl`, `4xl`, `5xl`: display sizes for a countdown or a clock |
| `weight`                                | `regular` | `regular`, `medium`, `bold`. Eyebrow and `as="strong"` are bold                                                                                           |
| `tone`                                  | `inherit` | `inherit`, `neutral`, `muted`, `accent`, `success`, `warning`, `danger`, `info`. Lead, caption and eyebrow are muted                                      |
| `align`                                 | –         | `start`, `center`, `end`; follows the reading direction. Makes an inline element a block                                                                  |
| `truncate`                              | `false`   | `true`: one line with an ellipsis. A number: that many lines                                                                                              |
| `wrap`                                  | –         | `pre`: keep spaces and line breaks (still wraps at the edge). `break`: break long ids and URLs anywhere                                                   |
| `numeric`                               | `false`   | Tabular figures, so digits line up                                                                                                                        |
| `htmlFor`                               | –         | With `as="label"`: id of the control                                                                                                                      |
| `dateTime`                              | –         | With `as="time"`: machine-readable date                                                                                                                   |
| `id`                                    | –         | For `aria-labelledby` and `aria-describedby`                                                                                                              |
| `className` / `style`                   | –         | Layout only                                                                                                                                               |
| `id`, `data-*`, `role`, `aria-*`, `ref` | –         | Set on the root element (a link target, test or state hooks, a live region)                                                                               |

The ref is forwarded to the element.

## Behaviour

- **A variant only sets defaults.** `size`, `weight` and `tone` given explicitly always win; the eyebrow keeps its uppercase, tracking and mono face.
- **No margins, element's own display.** `span`, `label`, `strong`, `em`, `small` and `time` are inline; `p`, `div` and `figcaption` are blocks. A `<p>` has no margin: space text with `Stack` or `Inline`.
- **Nested Text keeps the outer type.** A Text directly inside another Text (a value, a bold word) takes the outer size, weight, face, tracking and case, and changes only what it is given. An inner Text with a `variant` is that preset again.
- **Truncation.** One line: an inline element becomes an inline block no wider than its container. Several lines: the element becomes a block clamped to that many lines. The full text stays in the DOM.
- **Wrapping.** `wrap="pre"` keeps the text's spaces and line breaks (`white-space: pre-wrap`), for a query or a log line. `wrap="break"` lets a long unbroken string (an id, a hash, a URL) break anywhere instead of overflowing its container (`overflow-wrap: anywhere`). `truncate` wins over both.
- **Display sizes.** `3xl`, `4xl` and `5xl` are larger than `2xl` (1.4, 2 and 3 times it by default) with a line height of 1.1, for one large figure: a countdown, a clock. With `numeric` the digits keep their width as they tick (tested). Put a ticking value inside an element with `role="timer"`.
- **Colour.** Tones use the readable text colours (`--cy-color-<tone>-text`), which keep 4.5:1 on the page background (tested, as are the muted presets).
- **Uppercase is visual only.** The eyebrow is the only variant that applies `text-transform`; the text in the DOM keeps its case.
- **Host CSS.** Host rules for `span` and `div` (weight, case, tracking, colour, size, line height) do not change it (tested).

## Accessibility

Text adds no role. Choose the element for meaning: `label` with `htmlFor` for a control without a Cynosure field label, `time` with `dateTime` for dates, `strong` and `em` for emphasis. A truncated text is still read in full by screen readers; sighted users need another way to reach the rest, so do not truncate text people must read.

## Tokens

- `--cy-text-line-height`: line height of every variant (default `--cy-font-line-height`)
- `--cy-text-size-3xl`, `--cy-text-size-4xl`, `--cy-text-size-5xl`: the display sizes (default 1.4, 2 and 3 times `--cy-font-size-2xl`)
- `--cy-text-display-line-height`: line height of the display sizes (default 1.1)
- `--cy-text-lead-size`: font size of the lead variant (default `--cy-font-size-lg`)
- `--cy-text-caption-size`: font size of the caption variant (default `--cy-font-size-sm`)
- `--cy-text-eyebrow-size`: font size of the eyebrow variant (default `--cy-font-eyebrow-size`)
- `--cy-text-eyebrow-tracking`: letter spacing of the eyebrow variant (default `--cy-font-eyebrow-tracking`)
- `--cy-text-muted`: colour of the muted tone and the muted variants (default `--cy-color-muted`)
