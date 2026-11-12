# Card

Content container with `variant` (`surface`, `outline`, `soft`), `padding` (`none`, `sm` 8px, `md` 16px, `lg` 24px), `tone` and `as` (`div`, `section`, `article`, `li`, `aside`).

```tsx
<Card variant="outline" padding="lg">…</Card>
<Card href="/settings">Whole card is one link</Card>
<Card onClick={choose}>Whole card is one button</Card>
<Card edge="success">Garden <Badge tone="success">Home</Badge></Card>
<Card edge="#7c3aed">Any CSS colour</Card>
<Card as="section" title="Connection" description="Where the client connects." actions={<Button size="sm">Edit</Button>}>…</Card>
```

Interactive cards render through `LinkBase` (`href`, unsafe schemes are not linked) or `ButtonBase` (`onClick`, `disabled`). Keep their content non-interactive: one card, one target.

- `edge`: a coloured edge on the inline-start side (left in left-to-right text, right in right-to-left), for a category or a status. A tone name (`accent`, `neutral`, `danger`, `success`, `warning`, `info`) uses that tone's colour token; any other string is a CSS colour. It is the card's own start border, so it follows the card's radius, works with every `variant` and `tone`, on link and button cards and with `actions`, and keeps its colour on hover and focus. The content starts after it. In forced colours it stays as a thicker edge in the system text colour.
- `title`, `description` and `headingLevel` (default 3): a header above the content. In a static or link card the title is a heading; in a button card it is plain text (a button may not hold a heading) and the header and body are spans. A `section`, `article` or `aside` card is named by its title. With `actions`, the header shares its row with them and the title wraps before them, on static, link and button cards alike.
- `aria-current`: marks a link or button card as the current one of a set (`"page"` in a grid of sections). Screen readers announce it and the border takes the accent (`--cy-card-current-border`).
- Do not let the edge colour be the only carrier of meaning: people who cannot tell the colours apart, and screen reader users, get nothing from it. Say the same thing in the card's text or with a [Badge](../Badge/README.md).

## Tokens

- `--cy-card-bg`, `--cy-card-border`, `--cy-card-current-border`, `--cy-card-radius`, `--cy-card-shadow`, `--cy-card-soft-mix`
- `--cy-card-edge-width`: thickness of the `edge` (default `--cy-space-2`)
- `--cy-card-title-size`: font size of the `title` (default `--cy-font-size-lg`)

- `actions`: buttons on a clickable card that act on their own (a game card's 2-player mode). They sit over the card's top end, outside its one link or button, so nothing interactive is nested; `style` then goes on the shared frame.
