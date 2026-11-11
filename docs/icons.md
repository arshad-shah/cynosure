# Icons

Cynosure ships two kinds of icon, both drawn by the same `Icon` component. [Search them all on the documentation site](https://cynosure.arshadshah.com/icons/), where pressing an icon copies its import.

- **Facet icons** (`@arshad-shah/cynosure/icons`): Cynosure's own set, 240 icons in 16 categories.
- **Brand marks** (`@arshad-shah/cynosure/brands`): the official logos of 97 companies and projects, exactly as their owners publish them.

## Facet icons

One grammar: a 24 grid, a 1.75 round stroke, softened-square geometry, strokes only. The categories (`ICON_CATEGORIES`) are arrows, navigation, actions, editing, files, data, media, communication, status, time, security, people, devices, design, layout and maths. Search them at the top of the [Icons page](https://cynosure.arshadshah.com/icons/), or browse them in Storybook: **Foundations → Icon → Gallery** (hover a tile to see its motion).

```tsx
import { Icon } from "@arshad-shah/cynosure";
import { search } from "@arshad-shah/cynosure/icons";

<Icon icon={search} />                              // decorative (hidden from screen readers)
<Icon icon={search} label="Search" />               // role="img" with a name
<Icon icon={search} size="lg" tone="accent" />      // sm 14 · md 16 · lg 20 · or a number of px
<Icon icon={search} color="#14b8a6" />              // a one-off colour
```

Import icons by name so unused ones are left out of your bundle. Names are camelCase versions of the icon's kebab-case name (`arrow-up-right` → `arrowUpRight`); reserved words get an `Icon` suffix (`packageIcon`).

**Adding one:** draw it on a 24 grid with strokes only, export the SVG, then run `pnpm cy new icon <name> --from icon.svg --category <category>`. In the generated file, set `motion` and mark the moving part `animate: true`. See `src/icons/AGENTS.md`.

## Brand marks

```tsx
import { Icon } from "@arshad-shah/cynosure";
import { github, npm } from "@arshad-shah/cynosure/brands";

<Icon icon={github} label="GitHub" />                    // in the text colour (a one-colour mark)
<Icon icon={npm} label="npm" color="brand" size="lg" />  // in npm's own colour
```

Brands let their logos be used only as they publish them, so these are never redrawn in Facet's style:

- **Don't** change a mark's shape, proportions or colours (other than one colour throughout, or `color="brand"`).
- **Don't** combine a mark with other shapes, or use it to suggest the brand endorses your product.
- **Do** read the brand's own guidelines when you use its mark prominently. Each mark carries `brand.guidelines` (where published) and `brand.source`.

The marks come from [Simple Icons](https://simpleicons.org) (CC0). The trademarks remain their owners'. The list is `tools/brands.json`; regenerate with `node --import tsx tools/brands.ts <unpacked simple-icons package>`.

**Not included, at the owners' request:** some companies ask icon sets not to carry their marks. Use their own brand kits instead:
- LinkedIn: <https://brand.linkedin.com/>
- Slack: <https://slack.com/media-kit>
- OpenAI: <https://openai.com/brand>
- CodePen: <https://blog.codepen.io/documentation/brand-assets/>
- AWS: <https://aws.amazon.com/co-marketing/>
- Microsoft and Azure: <https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks>

## Without React

`iconToSvg` returns the same markup as `Icon`, as a string, for Astro components, static HTML or plain TypeScript. Load `@arshad-shah/cynosure/styles/icon.css` (or the full `styles.css`) so it sizes and colours the same way.

```ts
import { iconToSvg, search } from "@arshad-shah/cynosure/icons";
import { github } from "@arshad-shah/cynosure/brands";

element.innerHTML = iconToSvg(search, { label: "Search" });
const mark = iconToSvg(github, { size: 20, color: "brand", label: "GitHub" });
```

Options: `size` (`sm`, `md`, `lg` or px), `label` (gives `role="img"`; omit for decorative icons), `color` (any CSS colour, or `brand`) and `className`. Labels and classes are escaped.
