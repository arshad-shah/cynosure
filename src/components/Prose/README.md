# Prose

Typography for long text you do not style element by element: rendered Markdown, docs pages, release notes, help articles. Wrap the HTML and its headings, paragraphs, lists, links, quotes, code, tables and images get Cynosure's type, colours and spacing.

```tsx
import { Prose } from "@arshad-shah/cynosure";

<Prose as="article">
  <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
</Prose>;
```

| Prop                  | Default | Notes                                  |
| --------------------- | ------- | -------------------------------------- |
| `size`                | `md`    | Body text size; headings scale from it |
| `as`                  | `div`   | `div` · `article` · `section`          |
| `className` / `style` | –       | Layout only                            |
- Styles plain elements only. Cynosure components inside (a Badge, a Button, a CopyButton) keep their own styles: the rules stop at any `cy-` element (`@scope` with a lower boundary).
- Rules have the lowest specificity, so they beat host resets such as Tailwind preflight (scope proximity) while your own classes, such as a syntax highlighter's, still win.
- Lines stop at about 70 characters (`--cy-prose-measure`). Code blocks wrap long lines instead of scrolling, so there is no scroll region keyboard users cannot reach.

## Tokens

- `--cy-prose-measure`: longest line (default 70ch)
- `--cy-prose-flow`: space between blocks (default 1em)
- `--cy-prose-link`: link colour (default the accent text colour)
- `--cy-prose-code-background`: inline code and code block background
