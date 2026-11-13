# Disclosure

Shows and hides a section behind a button. Replaces native `<details>`/`<summary>` with an animated, themeable version.

```tsx
<Disclosure summary="Advanced options">…</Disclosure>
<Disclosure summary="Details" open={open} onOpenChange={setOpen} variant="card" />
```

| Prop                                    | Default | Notes                                                  |
| --------------------------------------- | ------- | ------------------------------------------------------ |
| `summary`                               | –       | Trigger text                                           |
| `open` / `defaultOpen` / `onOpenChange` | `false` | Controlled or uncontrolled                             |
| `variant`                               | `plain` | `plain` · `line` (divider) · `card` (bordered surface) |
| `edge`                                  | –       | Coloured inline-start edge: a tone or any CSS colour   |
| `trailing`                              | –       | Content at the end of the summary row (a Badge)        |
| `size`                                  | `md`    | `sm` · `md` · `lg`                                     |
| `headingLevel`                          | –       | Wrap the trigger in `h1`–`h6`                          |
| `region`                                | `false` | Content as a region labelled by the trigger            |
- Height animates by interpolating a grid row (0fr to 1fr) in every engine, no script; `--cy-motion-base` sets the speed and reduced motion (OS or `createTheme({ motion: "reduced" })`) makes it instant.
- Closed content is `visibility: hidden` after the collapse: not focusable, not announced.
- Trigger: `aria-expanded`, `aria-controls`; Enter and Space toggle; 44px tall on coarse pointers.

- `edge` works as Card's: a tone name uses that tone's colour, any other string is a CSS colour; it follows the reading direction, and plain and line sections get inner padding so the text clears it.
- `trailing` sits between the summary and the chevron but outside the trigger button, so its text is not part of the trigger's name and a Button there is its own tab stop. Pressing plain content there (a Badge) toggles the section.

Tokens: `--cy-disclosure-gap`, `--cy-disclosure-radius`, `--cy-disclosure-padding-inline`, `--cy-disclosure-edge-width`.

**Printing:** printed open, whatever its state on screen; the chevron is left out.
