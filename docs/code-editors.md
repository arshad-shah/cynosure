# Code editors and highlighters

Cynosure has one set of code colours, as tokens, so any editor or highlighter can be styled from your theme: CodeMirror, Monaco, Shiki, Prism, highlight.js, or your own. Cynosure does not include an editor and adds no dependency for this.

## The colours

Twelve syntax roles are palette colours, beside the others: `--cy-color-syntax-{comment, keyword, string, number, function, type, variable, property, operator, tag, attribute, regexp}`.

- Each reads at least **4.5:1** on the page, the surface, the soft fill and raised surfaces, in light and dark, and **7:1** in the high-contrast palettes.
- **Keywords take your accent**, so code looks like your product; the other roles keep their own hues and are moved only as far as contrast needs.
- Change any of them like any other colour: `createTheme({ palettes: { dark: { syntaxString: "#a6d189" } } })`.

## Editors styled with CSS

Load the opt-in stylesheet. It is not part of `styles.css` because it styles other libraries' class names.

```ts
import "@arshad-shah/cynosure/styles/syntax.css";
```

| Editor or highlighter | What to do                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CodeMirror 6**      | Add `syntaxHighlighting(classHighlighter)` from `@lezer/highlight`. The stylesheet colours the `tok-*` classes and the editor's own surfaces (gutter, active line, cursor, selection). |
| **Prism**             | Nothing more: `.token.*` classes are covered.                                                                                                                                          |
| **highlight.js**      | Nothing more: `.hljs-*` classes are covered.                                                                                                                                           |
| **Shiki**             | Use Shiki's `css-variables` theme: the stylesheet sets its `--shiki-*` variables from the tokens.                                                                                      |

Because these read the tokens, light, dark, high contrast and theme changes follow on their own. Every selector is wrapped in `:where()`, so your own rules always win.

## Editors that take a theme object

Monaco and Shiki's TextMate themes need colours as values. Build them from the same theme, one per palette, and switch with the page's mode (`useColorMode`):

```ts
import { createTheme, monacoTheme, textMateTheme } from "@arshad-shah/cynosure/tokens";

const theme = createTheme({ accent: "#2563eb" });
monaco.editor.defineTheme("cynosure-light", monacoTheme(theme, "light"));
monaco.editor.defineTheme("cynosure-dark", monacoTheme(theme, "dark"));

const highlighter = await createHighlighter({
  themes: [textMateTheme(theme, "light"), textMateTheme(theme, "dark")],
  langs: ["ts"],
});
```

`editorColors(theme, palette)` gives the plain colours (background, foreground, line numbers, gutter, active line, selection, cursor, and each role) for anything else.

## With CodeBlock

CodeBlock takes your highlighter through `highlight`. Its output is coloured by `syntax.css` when it uses Prism, highlight.js or Shiki's `css-variables` classes.
