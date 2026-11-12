# Stat

A figure with its label, a KPI tile: the value with an optional unit, the change since last time and a line of context, on a Card. With `href` the whole tile is one link to the figure's detail.

```tsx
import { Grid, Stat } from "@arshad-shah/cynosure";
import { users } from "@arshad-shah/cynosure/icons";

<Stat label="Revenue" value="£12,400" delta={{ value: "+12%" }} description="vs last month" />
<Stat label="p95 latency" value="184" unit="ms" delta={{ value: "-8%", tone: "success" }} />
<Stat label="Members" value="312" icon={users} href="/members" />

<Grid as="ul" minItemWidth="14rem">                            // a row of stats as a list
  <Stat as="li" label="Visitors" value="18,204" />
  <Stat as="li" label="Sign-ups" value="1,204" href="/sign-ups" />
</Grid>
```

| Prop                  | Default   | Notes                                                                                            |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `label`               | –         | Required. What is measured; the description list's term                                          |
| `value`               | –         | Required. The figure; tabular digits                                                             |
| `unit`                | –         | Written after the value, smaller and muted                                                       |
| `description`         | –         | A line under the value ("vs last month", "Last 30 days")                                         |
| `delta`               | –         | `{ value, direction?, tone? }`: an arrow, the change in a tone, and a spoken direction           |
| `icon`                | –         | A decorative IconTile at the start                                                               |
| `iconTone`            | `accent`  | Tone of the IconTile                                                                             |
| `size`                | `md`      | `sm` · `md` · `lg`: the value, the text, the tile and the padding                                |
| `align`               | `start`   | `start` (icon beside the text) · `center` (icon above, centred)                                  |
| `variant`             | `surface` | Card's `surface` · `outline` · `soft`                                                            |
| `as`                  | `div`     | `div` · `li` · `article`. With `href` and `li` or `article`, the link is put inside that element |
| `href` / `target`     | –         | The whole stat is one link (Card, through LinkBase: unsafe schemes are not linked)               |
| `onClick`             | –         | With `href`: called when the link is followed                                                    |
| `labels`              | English   | `{ up, down, flat }`: functions from the delta's value (without its sign) to the spoken words    |
| `className` / `style` | –         | Layout only                                                                                      |

The forwarded ref is the Card element (the link with `href`).

## Behaviour

- **Delta direction:** `direction` when given; otherwise `up` when the value starts with `+`, `down` when it starts with `-` or `−`, and `flat` otherwise.
- **Delta tone:** `success` for up, `danger` for down, `neutral` for flat. Set `tone` when down is good news (costs, errors, load time).
- **Several stats:** there is no StatGroup. Put them in a [Grid](../Grid/README.md) (`minItemWidth` wraps them on narrow screens), with `as="ul"` and `as="li"` when they form a set.
- **One frame for several figures:** use Card with a Grid of figures inside, or [DescriptionList](../DescriptionList/README.md).

## Accessibility

- The label and the figures are a description list (`<dl>`): the label is the term (`dt`), and the value, delta and description are its definitions (`dd`), so a screen reader reads "Revenue, £12,400, up 12%, vs last month" and can tell which label a figure belongs to.
- The delta's visible figure is `aria-hidden`; a visually hidden sentence ("up 12%") is read instead, so the direction is not carried by colour or the arrow alone. The words come from `labels`.
- The icon tile is decorative: the label already names the stat.
- With `href` the whole stat is one link named by its text ("Revenue £12,400 up 12% vs last month"), with nothing interactive nested. It takes Card's hover, press and focus ring.

## Touch

A linked stat is a whole Card, far above the 44px coarse-pointer target. A static stat has nothing to press.

## Tokens

- `--cy-stat-gap`: space between the icon tile and the text (`--cy-space-5`)
- `--cy-stat-label-color`: colour of the label, unit and description (`--cy-color-muted`)
- `--cy-stat-value-font`: font family of the value (`--cy-font-display`)
- `--cy-stat-value-weight`: font weight of the value (`--cy-font-weight-bold`)
- `--cy-stat-value-size-sm`, `--cy-stat-value-size-md`, `--cy-stat-value-size-lg`: value size (`--cy-font-size-xl`, `--cy-font-size-2xl`, `1.45 times --cy-font-size-2xl`)

The frame is a Card: restyle it through the `--cy-card-*` tokens. Set Stat's with `createTheme({ components: { stat: { valueWeight: "500" } } })`.
