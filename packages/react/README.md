# @arshad-shah/cynosure-react

> React component library for Cynosure UI — headless-at-the-core, themed-on-top, pay-for-what-you-import.

Every component ships as its own ESM entry point with its own CSS, so bundlers keep only what you use. Behaviour is a hybrid of Radix primitives and React Aria for accessibility; styling is driven by W3C DTCG design tokens from [`@arshad-shah/cynosure-tokens`](https://www.npmjs.com/package/@arshad-shah/cynosure-tokens).

---

## Install

```bash
pnpm add @arshad-shah/cynosure-react @arshad-shah/cynosure-tokens
```

Peer requirements: `react@^19`, `react-dom@^19`. Forms use `react-hook-form@^7`.

Load styles once at your app root:

```ts
import '@arshad-shah/cynosure-tokens/css';          // light tokens
import '@arshad-shah/cynosure-tokens/css/dark';     // dark-mode overrides
import '@arshad-shah/cynosure-react/styles.css';    // component styles
```

---

## Quick start

```tsx
import { Button, Stack, ThemeProvider } from '@arshad-shah/cynosure-react';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Stack gap="3" align="center">
        <Button>Get started</Button>
        <Button variant="soft" colorScheme="accent">Read the docs</Button>
      </Stack>
    </ThemeProvider>
  );
}
```

### Per-component imports

Every component has a subpath export for minimum bundle size:

```ts
import { Button } from '@arshad-shah/cynosure-react/button';
import { Dialog } from '@arshad-shah/cynosure-react/dialog';
import { DataTable } from '@arshad-shah/cynosure-react/data-table';
```

The subpath entry imports only that component's code and CSS — no barrel-file fallout.

---

## What's inside

Layout primitives (`box`, `stack`, `grid`, `flex`, `center`, `container`, `section`, …), typography (`text`, `heading`, `code`, `kbd`, `link`, `blockquote`, `list`), forms (`input`, `select`, `combobox`, `slider`, `date-picker`, `file-upload`, `pin-input`, `tags-input`, …), overlays (`dialog`, `alert-dialog`, `drawer`, `popover`, `hover-card`, `tooltip`, `toast`, `dropdown-menu`, `context-menu`), navigation (`tabs`, `breadcrumb`, `pagination`, `sidebar`, `stepper`), data display (`card`, `table`, `data-table`, `tree`, `timeline`, `stat`, `progress`, `skeleton`, `accordion`, `scroll-area`, …), feedback (`alert`, `banner`, `notification`, `callout`, `empty-state`), and form composition (`form`, `rhf`) wired for React Hook Form.

The full inventory, props reference, and live examples live in the Storybook docs site.

---

## Themes

Drop-in theme presets from [`@arshad-shah/cynosure-themes`](https://www.npmjs.com/package/@arshad-shah/cynosure-themes):

```ts
import '@arshad-shah/cynosure-themes/terminal';        // JetBrains Mono, green-on-black
import '@arshad-shah/cynosure-themes/high-contrast';   // WCAG AAA contrast everywhere
```

Or build your own by overriding the token CSS variables — see [`custom-themes`](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/custom-themes.mdx).

---

## Links

- [Main repo](https://github.com/arshad-shah/cynosure) — source, issues, contributor guide
- [Migration guide (0.x → 1.0)](https://github.com/arshad-shah/cynosure/blob/main/docs/reference/migration-to-v1.mdx)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
