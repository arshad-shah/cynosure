# Migrating a product to Cynosure

Tracked as one issue per product repo. Order of work in a product:

1. `pnpm add @arshad-shah/cynosure`; import `styles.css` (or `styles.inline` in shadow roots).
2. Wrap the root in `<CynosureTheme theme={createTheme({ accent, scale })}>`; delete the product's own token system.
3. Replace product components with Cynosure ones; replace icons with Facet icons; delete native controls.
4. Anything missing goes into Cynosure (with tests), never back into the product.

Available now (the README "## Components" groups):

- **Controls:** Button, IconButton, CopyButton, Link, TextField, NumberField, SearchField, TextArea, Select, Combobox, TagInput, Checkbox, Switch, RadioGroup, SegmentedControl, Slider, DateField, TimeField, Checklist, Pagination, ColorField, ColorSwatches, KeyValueEditor, FileDrop, PathField, SignaturePad, SelectionFrame, CompareSlider, ThemeToggle, Choice, OptionList, HotkeyField, SortButton, RowActions.
- **Structure:** AppShell (`useAppShell`), TitleBar, StatusBar, Container, PageHeader, Stack, Inline, Grid, ScrollArea, Divider, AspectRatio, Breadcrumbs, SideNav, SplitPane, Card, Toolbar, Tabs, Disclosure, Accordion, Tree, SortableList, VirtualList, Calendar, DocumentViewport, PanZoomCanvas, ZoomControls, Section, SiteHeader, SiteFooter, SkipLink, ListRow (`ListRows`), OverlayFrame, VisuallyHidden.
- **Overlays:** Tooltip, HoverCard, Popover, FloatingToolbar (`DockedToolbar`), Menu, Menubar, ContextMenu, Dialog, ProgressOverlay, Sheet, CommandPalette (`useHotkey`), Toast (`Toaster`, `useToast`).
- **Feedback and display:** Notice, EmptyState, ErrorBoundary, ProgressBar, Steps, LoadingDots, Skeleton, DescriptionList, Stat, List, Table, Text, Heading, Prose, Avatar (`AvatarGroup`), IconTile, Image, CodeBlock, Announcer (`useAnnounce`), Badge, Kbd, Field, DataGrid, HighlightedText, ChatMessage, QRCode, DeviceFrame.
- **Icons:** 274 Facet icons, 98 brand marks (`@arshad-shah/cynosure/brands`), and `iconToSvg` for pages without React.

Anything a product needs that is still missing goes into Cynosure first.

| Scope          | Products                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full           | prism, aperture-css, smart-audio-capture, request-interceptor, session-recorder, snapforge, algo-visual (Stepframe), algosnap, whetstone, planr, exposure-map, tools |
| From the start | verql                                                                                                                                                                |
| Partial        | brothers-arcade (overlays), portfolio-v6, nimaz-web (tokens, icons, islands), detent and swiftchart docs (tokens), for-spogmay (tokens, icons)                       |
| Archive        | ui-library                                                                                                                                                           |
