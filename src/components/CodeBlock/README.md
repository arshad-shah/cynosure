# CodeBlock

Code to read and copy: a header with the file name or language and a copy button, then the code, with optional line numbers. Bring your own highlighter; Cynosure bundles none.

```tsx
import { CodeBlock } from "@arshad-shah/cynosure";

<CodeBlock code={source} title="vite.config.ts" language="ts" lineNumbers />
<CodeBlock code={source} language="ts" highlight={(code, lang) => <Highlighted code={code} lang={lang} />} />;
```

| Prop                    | Default | Notes                                                                                               |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `code`                  | –       | The source; one final new line is dropped                                                           |
| `title`                 | –       | File name or caption for the header (names the block)                                               |
| `language`              | –       | Shown when there is no `title`; passed to `highlight`; set as `data-language`                       |
| `highlight`             | –       | `(code, language) => ReactNode`, e.g. Shiki or Prism output                                         |
| `tokenize`              | –       | `(code, language) => { text, kind? }[]`: coloured with the palette's syntax tokens, no CSS needed   |
| `lineNumbers`           | `false` | A gutter of numbers, hidden from screen readers and never copied                                    |
| `wrap`                  | `false` | Wrap long lines instead of scrolling sideways (line numbers are then left out)                      |
| `actions`               | –       | Buttons in the header before the copy button, e.g. "Insert into editor"                             |
| `size`                  | `md`    | Font size of the code: `sm` · `md` · `lg`                                                           |
| `maxLines` / `maxChars` | –       | Show only the first lines or characters of very long code, with a "Show all" button; copy takes all |
| `copyable`              | `true`  | The copy button (it copies `code`, not the highlighted markup)                                      |
| `copy`                  | –       | Passed to CopyButton, for extensions that copy through their own channel                            |
| `labels`                | –       | CopyButton's `copy`, `copied`, `failed`, plus `region` (name when there is no title)                |
- The block is a figure named by its title. When it scrolls sideways, the code is a focusable region (a tab stop), so keyboard users can scroll it.
- Tall code scrolls inside the block (`--cy-code-block-max-height`); line numbers scroll with it.

- `activeLines` (1-based): mark lines, such as the line a debugger is on. A band sits behind the text, the gutter number is bold, and "Line 3 highlighted" is read out (`labels.active`).

Your own tokenizer: `tokenize` returns the code as `{ text, kind }` stretches (`SyntaxKind`: comment, keyword, string, number, function, type, variable, property, operator, punctuation, tag, attribute, regexp), and each kind takes its `--cy-color-syntax-*` colour, readable on the code's background in light, dark and the contrast palettes. A stretch with no kind, or one it does not know, is plain text. `highlight` wins when both are given. See [docs/code-editors.md](../../../docs/code-editors.md).

Very long code (megabytes of output): `maxLines` and `maxChars` show only the start, found without splitting all of it, and the highlighter gets only that. A "Show all 5,000 lines" button under the code (`aria-expanded`, `aria-controls` the code; `labels.showAll`, `labels.showLess`) shows the rest and back. Copying, and the `code` your actions use, is always the whole text.

## Tokens

- `--cy-code-block-background`, `--cy-code-block-radius`, `--cy-code-block-max-height`
