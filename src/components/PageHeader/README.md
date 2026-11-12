# PageHeader

The top of a page or a major section: where you are (breadcrumbs or an eyebrow), what this is (the title), one or two sentences about it (the lead), and the page's actions. It is built from [Heading](../Heading/README.md) and [Text](../Text/README.md), so it follows their type scale and tokens.

```tsx
import { Breadcrumbs, Button, PageHeader } from "@arshad-shah/cynosure";

<PageHeader title="Projects" />

<PageHeader
  breadcrumbs={<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />}
  eyebrow="Workspace"
  title="Projects"
  description="Every project in this workspace, newest first."
  actions={<Button variant="solid" tone="accent">New project</Button>}
  divider
/>

<PageHeader size="lg" align="center" title="Capture anything" description="…" actions={…} />
```

| Prop                  | Default  | Notes                                                                                                         |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `title`               | required | The header's one heading, rendered with `Heading`                                                             |
| `headingLevel`        | `1`      | `1`, `2` or `3`, to fit the page outline                                                                      |
| `size`                | `md`     | `md`: Heading's usual size for the level (level 1 `2xl`, 2 `xl`, 3 `lg`). `lg`: Heading's `display` hero size |
| `titleSize`           | –        | Any Heading size for the title instead of `size`'s: `3xl` sits between `md` and `lg`                          |
| `eyebrow`             | –        | Small label above the title (`Text variant="eyebrow"`, a paragraph)                                           |
| `description`         | –        | Lead paragraph under the title (`Text variant="lead"`), at most 65ch wide. Inline content only                |
| `breadcrumbs`         | –        | Shown above the eyebrow and title. Pass a `Breadcrumbs`                                                       |
| `actions`             | –        | Buttons at the inline end; below the text when the header is narrower than 36rem or `align="center"`          |
| `meta`                | –        | A wrapping row under the description for badges, dates and authors (small, muted text)                        |
| `children`            | –        | Anything below the rest, at full width (tabs, a search field)                                                 |
| `align`               | `start`  | `center` centres every part and puts the actions below the text                                               |
| `divider`             | `false`  | A bottom border with space above it                                                                           |
| `as`                  | `header` | `header`, `div` or `section`                                                                                  |
| `className` / `style` | –        | Layout only                                                                                                   |

The ref is the root element (`HTMLElement`).

**Behaviour:** parts that are not given render nothing, so `<PageHeader title="…" />` is exactly as tall as its heading. The header has no outer margin or padding (the page layout spaces it) and fills its parent's width. It is a size container: the actions move below the text when the header's own width is under 36rem, whatever the viewport, and nothing overflows at 320px (long words in the title break, the actions wrap). The 36rem switch is fixed, because a container query cannot read a token. Beside the text, the actions take at most half the width and wrap within it.

**Accessibility:** the title is the only heading, at `headingLevel`. The DOM and reading order is breadcrumbs, eyebrow, title, description, meta, actions, children: the eyebrow is read before the title, as context for it. The root has no role. A `header` element inside `main` is not a banner landmark, which is what a page header should be; if you place it outside `main`, `article` or `section`, use `as="div"`. An unnamed `section` is not a landmark either. PageHeader has nothing pressable of its own: hit areas and keyboard behaviour belong to the buttons, breadcrumbs and fields you pass in. In right-to-left text the actions sit on the left.

## Tokens

- `--cy-page-header-gap`: space between the breadcrumbs, the title block, the actions and the content below them (`--cy-space-6`)
- `--cy-page-header-text-gap`: space between the eyebrow, the title, the description and the meta row (`--cy-space-3`)
- `--cy-page-header-actions-gap`: space between two actions and between items of the meta row (`--cy-space-4`)
- `--cy-page-header-description-max-width`: longest line of the description (65ch)
- `--cy-page-header-divider-color`: colour of the bottom border drawn by `divider` (`--cy-color-line`)
- `--cy-page-header-divider-space`: space between the content and that border (`--cy-space-6`)

Set them with `createTheme({ components: { pageHeader: { textGap: "0.5rem", descriptionMaxWidth: "50ch" } } })`. The title, eyebrow and lead are retuned through the `--cy-heading-*` and `--cy-text-*` tokens.
