# List

A real list (`ul` or `ol`) with drawn markers: bullets, numbered how-to steps, a ticked feature list, or an icon per item. Each item has a label and an optional description under it.

```tsx
import { List } from "@arshad-shah/cynosure";
import { lock, zap } from "@arshad-shah/cynosure/icons";

<List items={[{ label: "Apples" }, { label: "Pears" }]} />

<List                                                   // a numbered how-to: an <ol>
  marker="number"
  label="Install"
  items={[
    { label: "Add the package", description: "pnpm add @arshad-shah/cynosure" },
    { label: "Import the styles", description: "Once, at the root of the app." },
  ]}
/>

<List marker="check" items={[{ label: "Unlimited projects" }, { label: "Custom domains" }]} />

<List
  marker="tile"
  items={[
    { label: "Fast", description: "Builds in under a second.", icon: zap },
    { label: "Private", description: "Nothing leaves the device.", icon: lock },
  ]}
/>
```

| Prop                  | Default                      | Notes                                                                                    |
| --------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `items`               | –                            | Required. `{ id?, label, description?, icon?, tone? }[]`                                 |
| `marker`              | `disc`                       | `disc` · `number` · `check` · `icon` · `tile` · `none`                                   |
| `as`                  | `ol` with numbers, else `ul` | Set it when the order matters but the markers are not numbers, or the other way round    |
| `start`               | `1`                          | First number with `marker="number"` (also the `ol`'s `start`)                            |
| `icon`                | –                            | Every item's icon for `icon` and `tile`; an item's own `icon` wins; with neither, a disc |
| `tone`                | per marker                   | Marker colour: muted discs, `success` ticks, `accent` otherwise. An item's `tone` wins   |
| `gap`                 | `md`                         | `none` · `sm` · `md` · `lg`: space between items                                         |
| `divided`             | `false`                      | A line between items, the gap split around it                                            |
| `size`                | `md`                         | `sm` · `md` · `lg`: text size, and the markers with it                                   |
| `label`               | –                            | Names the list for assistive technology when no heading above it does                    |
| `className` / `style` | –                            | Layout only                                                                              |

The forwarded ref is the `ul` or `ol`.

## Behaviour

- **Markers are drawn**, not the browser's bullets, so they take tokens and tones and sit on the first line of an item with a description. They follow the reading direction.
- **Numbers** count from `start` in item order and are tabular. They are drawn in a tinted circle as tall as a line of the label.
- **Tiles:** a one-line item is centred on its tile; an item with a description hangs from the tile's top. Tiles are `sm` for `sm` and `md` lists, `md` for `lg`.
- **Descriptions** are smaller and muted; an item with a description shows its label as a medium-weight title.
- **Steps** is the component for progress through a flow (a current step, complete and upcoming). Use List with `marker="number"` for instructions with no progress.

## Accessibility

- Always a real `ul` or `ol` with `li` items, with `role="list"` set explicitly, because Safari drops the list role from a list without bullets. Screen readers announce the list and its length, and the position of each item.
- Every marker is `aria-hidden`: the list already gives each item's position, so a number is not read twice, and icons and tiles are decoration.
- Nothing is focusable or pressable. Put a Link or a Button inside an item's label or description when an item should act.
- Forced colours: discs draw in `CanvasText`, number circles get a `CanvasText` outline.

## Tokens

- `--cy-list-gap-sm`, `--cy-list-gap-md`, `--cy-list-gap-lg`: space between items (`--cy-space-3`, `--cy-space-5`, `--cy-space-7`)
- `--cy-list-marker-gap`: space between the marker and the text (`--cy-space-5`)
- `--cy-list-marker-color`: colour of a disc with no tone (`--cy-color-muted`)
- `--cy-list-number-size`: diameter of the circle behind a number (one line of the label)
- `--cy-list-description-color`: colour of the description (`--cy-color-muted`)
- `--cy-list-divider-color`: colour of the line with `divided` (`--cy-color-line`)

Set them with `createTheme({ components: { list: { markerGap: "12px" } } })`.
