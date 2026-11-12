# Section

A full-width band of a page: a background, space above and below, and the content in the page column (a [Container](../Container/README.md)). Stack Sections to build a landing or documentation page that scrolls as a document.

```tsx
import { Heading, Section } from "@arshad-shah/cynosure";

<Section as="header" variant="plain">…hero…</Section>
<Section variant="soft" id="features" aria-labelledby="features-heading">
  <Heading id="features-heading">Features</Heading>
  …
</Section>
<Section variant="accent" paddingBlock="10" size="md">…call to action…</Section>
```

| Prop                                          | Default                             | Notes                                                            |
| --------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `variant`                                     | `plain`                             | `plain` (no background) · `surface` · `soft` · `accent`          |
| `paddingBlock`                                | `--cy-section-padding-block` (80px) | Space token for the padding above and below                      |
| `contained`                                   | `true`                              | Content in a centred Container; `false` lets it fill the band    |
| `size`                                        | `lg`                                | The inner Container's `size`: `sm` · `md` · `lg` · `xl` · `full` |
| `as`                                          | `section`                           | `section` · `div` · `header` · `footer` · `aside` · `article`    |
| `id`, `aria-labelledby`, `aria-label`, `role` | –                                   | Set on the root                                                  |
| `className` / `style`                         | –                                   | Layout only                                                      |

The ref goes to the root element.

## Width and full bleed

A Section fills its parent's width; it never breaks out of it. For bands that run from edge to edge of the window, place the Sections at the top level of the page, side by side with the header and footer, not inside a Container: each Section brings its own Container for the content. To keep a band's background full width but its content in a narrower column, set `size`.

## Behaviour and accessibility

- **Landmarks:** a `section` is a region landmark only when it has a name. Give it `aria-labelledby` (the id of its heading) when it should be one, as main parts of a page usually should. `as="aside"` is a complementary landmark; `as="header"` and `as="footer"` are the banner and contentinfo landmarks only at the top level of the page.
- **In-page links:** `id` makes the Section the target of a link such as `#pricing`.
- **Colours:** text keeps the ink colour on every variant, which stays readable on each background in light, dark and high-contrast themes. In forced-colours mode, where backgrounds are dropped, bands with a background get a line above and below.
- **Nesting:** a Section inside another gets its own default padding and inherits none of its parent's.
- **Touch and keyboard:** nothing pressable of its own.

## Tokens

- `--cy-section-padding-block`: padding above and below when `paddingBlock` is not set (twice `--cy-space-10`)
- `--cy-section-surface`: background of `variant="surface"` (`--cy-color-surface`)
- `--cy-section-soft`: background of `variant="soft"` (`--cy-color-soft`)
- `--cy-section-accent`: background of `variant="accent"` (`--cy-color-accent-soft`)

Set them with `createTheme({ components: { section: { paddingBlock: "6rem" } } })`.
