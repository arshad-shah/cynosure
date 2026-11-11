<p align="center"><img src="brand/cynosure-lockup.svg" alt="Cynosure" width="260"></p>

# Cynosure

One small, themeable, accessible UI system, used by all my projects: browser extensions, web apps and sites. Same feel and layout everywhere; each project sets its accent, its scale and any token it needs.

- **Tiny and tree-shaken**: one module per component and icon, and one small runtime dependency ([Detent](https://github.com/arshad-shah/detent), for dragging).
- **Looks identical anywhere**: pages, iframes, extension popups and shadow roots; host CSS can't break it.
- **Every property is a token**: `createTheme({ accent, scale, radius, font, tokens, components })`.
- **Icons**: 240 Facet stroke icons in 16 categories (softened-square geometry, built-in micro-animations), 97 official brand marks, and `iconToSvg` for pages without React.
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

**Documentation:** https://cynosure.arshadshah.com (every component with live examples, its props and its keyboard behaviour).

## Docs

| Read this                                                      | For                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Theming](docs/theming.md)                                     | Accent, scale, radius, fonts, light and dark, per-component tokens |
| [Icons](docs/icons.md)                                         | Facet icons, brand marks and how brands allow them to be used      |
| [Accessibility](docs/accessibility.md)                         | What every component guarantees, and how it is tested              |
| [Without React](docs/without-react.md)                         | Tokens and icons in Astro pages, static sites and plain TypeScript |
| [Code editors](docs/code-editors.md)                           | Code colours for CodeMirror, Monaco, Shiki, Prism and highlight.js |
| [Build adapters](docs/adapters.md)                             | The Vite adapter and shadow roots (`styles.inline`)                |
| [Migrating a product](docs/migration.md)                       | The order of work to move a product onto Cynosure                  |
| [Architecture](docs/architecture.md)                           | How the package is put together                                    |
| [Conventions](docs/conventions.md), [Testing](docs/testing.md) | The rules `pnpm check` enforces, and how components are tested     |
| [Release](docs/release.md)                                     | How versions are published to npm                                  |
| [AGENTS.md](AGENTS.md)                                         | Rules for anyone (person or agent) changing Cynosure               |

## Components

- **Foundations:** ButtonBase, LinkBase, InputBase, FileInputBase, TextAreaBase, ChoiceBase, HiddenValue, DialogBase, Icon (240 Facet icons and 97 brand marks); hooks `useRovingFocus`, `useDismiss`, `useDrag` (pointer dragging through Detent), `useControllableState`.
- **Controls:** Button, IconButton, CopyButton, Link, TextField, NumberField, SearchField, TextArea, Select, Combobox, TagInput, Checkbox, Switch, RadioGroup, SegmentedControl, Slider, DateField, TimeField, ColorField, ColorSwatches, KeyValueEditor, FileDrop, SignaturePad, SelectionFrame, CompareSlider, ThemeToggle.
- **Structure:** AppShell, Stack, Inline, Grid, SideNav, SplitPane, Card, Toolbar, Tabs, Disclosure, Accordion, Tree, SortableList, VirtualList, Calendar, DocumentViewport, PanZoomCanvas, ZoomControls.
- **Overlays:** Tooltip, HoverCard, Popover, FloatingToolbar (`DockedToolbar`), Menu, ContextMenu, Dialog, ProgressOverlay, Sheet, CommandPalette (`useHotkey`), Toast (`Toaster`, `useToast`).
- **Feedback and display:** Notice, EmptyState, ProgressBar, Steps, LoadingDots, Skeleton, DescriptionList, Table, Prose, CodeBlock, Announcer (`useAnnounce`), Badge, Kbd, Field. **Theme:** CynosureTheme, useColorMode, themeInitScript, createTheme.
- **Build:** optional Vite adapter (`@arshad-shah/cynosure/vite`), React-free tokens (`@arshad-shah/cynosure/tokens`) and self-hosted Hanken Grotesk (`fonts/hanken.css`).

> Status: pre-release (`0.x`), developed on `next`. Releases publish to npm from `main` through GitHub Actions (see [Release](docs/release.md)).
