<p align="center"><img src="brand/cynosure-lockup.svg" alt="Cynosure" width="260"></p>

# Cynosure

One small, themeable, accessible UI system for every Arshad Shah product: browser extensions, web apps and sites. Same feel and layout everywhere; each product sets its accent, its scale and any token it needs.

- **Tiny and tree-shaken**: zero runtime dependencies, one module per component and icon.
- **Looks identical anywhere**: pages, iframes, extension popups and shadow roots; host CSS can't break it.
- **Every property is a token**: `createTheme({ accent, scale, radius, font, tokens, components })`.
- **Facet icons**: 136 stroke icons in 15 categories, softened-square geometry, built-in micro-animations.
- **One prop vocabulary**: `size`, `tone`, `variant`, `color` on every component, so control is consistent.
- **Tested in real browsers**: every story is a behavioural, accessibility and touch test on Chromium, Firefox and WebKit.

```bash
pnpm add @arshad-shah/cynosure
```

```tsx
import "@arshad-shah/cynosure/styles.css";
import { Button, CynosureTheme, createTheme } from "@arshad-shah/cynosure";
import { download } from "@arshad-shah/cynosure/icons";

const theme = createTheme({ accent: "#e8462e", scale: "compact" });

export const App = () => (
  <CynosureTheme theme={theme} mode="system">
    <Button variant="solid" tone="accent" icon={download}>
      Export
    </Button>
  </CynosureTheme>
);
```

**Storybook:** https://arshad-shah.github.io/cynosure/ · **Contributing:** see [AGENTS.md](AGENTS.md) and [docs/](docs/).

> Status: pre-release (`0.x`) on branch `next`. Not yet published to npm.
