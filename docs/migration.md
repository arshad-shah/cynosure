# Migrating a product to Cynosure

Tracked as one issue per product repo (opened after Milestone 2). Order of work in a product:

1. `pnpm add @arshad-shah/cynosure`; import `styles.css` (or `styles.inline` in shadow roots).
2. Wrap the root in `<CynosureTheme theme={createTheme({ accent, scale })}>`; delete the product's own token system.
3. Replace product components with Cynosure ones; replace icons with Facet icons; delete native controls.
4. Anything missing goes into Cynosure (with tests), never back into the product.

Available now (Milestones 1 and 2, and Milestone 3 as it lands):

- **Controls:** Button, IconButton, CopyButton, Link, TextField, SearchField, TextArea, Select, Combobox, Checkbox, Switch, RadioGroup, SegmentedControl, Slider, ColorField, ThemeToggle.
- **Structure:** Stack, Inline, Grid, Card, Toolbar, Tabs, Disclosure, Accordion, Tree.
- **Overlays:** Tooltip, Popover, Menu, Dialog, Sheet, CommandPalette, Toast.
- **Feedback and display:** Notice, EmptyState, ProgressBar, Steps, LoadingDots, Skeleton, DescriptionList, Announcer (`useAnnounce`), Badge, Kbd, Field.
- **Icons:** 184 Facet icons.

Milestone 2 is the point at which the per-product migration issues open (Plan 4). Anything a product needs that is still missing goes into Cynosure first.

| Scope          | Products                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full           | prism, aperture-css, smart-audio-capture, request-interceptor, session-recorder, snapforge, algo-visual (Stepframe), algosnap, whetstone, planr, exposure-map |
| From the start | verql                                                                                                                                                         |
| Partial        | brothers-arcade (overlays), portfolio-v6, nimaz-web (tokens, icons, islands), detent and swiftchart docs (tokens), for-spogmay (tokens, icons)                |
| Archive        | ui-library                                                                                                                                                    |
