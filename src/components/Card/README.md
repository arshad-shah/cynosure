# Card

Content container with `variant` (`surface`, `outline`, `soft`), `padding` (`none`, `sm` 8px, `md` 16px, `lg` 24px), `tone` and `as` (`div`, `section`, `article`, `li`, `aside`).

```tsx
<Card variant="outline" padding="lg">…</Card>
<Card href="/settings">Whole card is one link</Card>
<Card onClick={choose}>Whole card is one button</Card>
```

Interactive cards render through `LinkBase` (`href`, unsafe schemes are not linked) or `ButtonBase` (`onClick`, `disabled`). Keep their content non-interactive: one card, one target.

Tokens: `--cy-card-bg`, `--cy-card-border`, `--cy-card-radius`, `--cy-card-shadow`, `--cy-card-soft-mix`.

## Used by

Settings panels, plan pickers, dashboard tiles, extension popups.
