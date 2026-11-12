# IconTile

A Facet icon on a tinted square (or circle): the mark of a feature, a settings section, a stat or a list item. It is decorative unless it has a `label`. For a person or a team, use [Avatar](../Avatar/README.md); for an icon in a line of text, use `Icon`.

```tsx
import { IconTile } from "@arshad-shah/cynosure";
import { zap } from "@arshad-shah/cynosure/icons";

<IconTile icon={zap} />                                   // decorative: text beside it names the thing
<IconTile icon={zap} label="Fast builds" />               // role="img", named
<IconTile icon={zap} tone="success" variant="solid" />
<IconTile icon={zap} size="lg" shape="circle" />
```

| Prop                  | Default  | Notes                                                                            |
| --------------------- | -------- | -------------------------------------------------------------------------------- |
| `icon`                | –        | Required. A Facet icon                                                           |
| `label`               | –        | Makes the tile `role="img"` with this name. Without it the tile is `aria-hidden` |
| `size`                | `md`     | `sm` · `md` · `lg`: the control heights, so they scale with the theme            |
| `tone`                | `accent` | `accent` · `neutral` · `danger` · `success` · `warning` · `info`                 |
| `variant`             | `soft`   | `soft` (tinted fill) · `solid` (full tone) · `outline` (tinted border, surface)  |
| `shape`               | `square` | `square` (radius from the theme's radius factor) · `circle`                      |
| `className` / `style` | –        | Layout only                                                                      |

The forwarded ref is the root `span`.

## Behaviour

- **Sizes** are the control heights (`--cy-control-height-*`), so a tile lines up with a Button or a field of the same size and grows with the theme's `scale`.
- **The icon** is half the tile (`--cy-icon-tile-icon-scale`), centred.
- **Square corners** are the tile's size times `--cy-radius-factor`, like a control.
- Not interactive: nothing to focus or press. To make one clickable, put it inside a Card with `href` or `onClick`, or use IconButton.

## Accessibility

- **Decorative (no `label`):** `aria-hidden="true"`. Use this when text beside the tile says what it is (a feature title, a stat label).
- **`label`:** `role="img"` with `aria-label`; the SVG inside stays hidden, so the name is read once.
- The icon draws in the tone's text colour (`--cy-color-<tone>-text`), or the on-tone colour for `solid`, so it keeps its contrast in light, dark and high contrast themes.
- Forced colours: the fill goes, a `CanvasText` border keeps the shape and the icon draws in `CanvasText`.

## Tokens

- `--cy-icon-tile-size-sm`, `--cy-icon-tile-size-md`, `--cy-icon-tile-size-lg`: width and height (`--cy-control-height-sm|md|lg`)
- `--cy-icon-tile-radius`: corner radius of the square (`size times --cy-radius-factor`)
- `--cy-icon-tile-soft-mix`: tint strength of `soft` (`16%`)
- `--cy-icon-tile-icon-scale`: icon size as a fraction of the tile (`0.5`)

Set them with `createTheme({ components: { iconTile: { radius: "4px" } } })`.
