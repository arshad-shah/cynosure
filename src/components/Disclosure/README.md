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
| `size`                                  | `md`    | `sm` · `md` · `lg`                                     |
| `headingLevel`                          | –       | Wrap the trigger in `h1`–`h6`                          |
| `region`                                | `false` | Content as a region labelled by the trigger            |
- Height animates by interpolating a grid row (0fr to 1fr) in every engine, no script; `--cy-motion-base` sets the speed and reduced motion (OS or `createTheme({ motion: "reduced" })`) makes it instant.
- Closed content is `visibility: hidden` after the collapse: not focusable, not announced.
- Trigger: `aria-expanded`, `aria-controls`; Enter and Space toggle; 44px tall on coarse pointers.

Tokens: `--cy-disclosure-gap`, `--cy-disclosure-radius`, `--cy-disclosure-padding-inline`.

**Printing:** printed open, whatever its state on screen; the chevron is left out.

## Used by

Prism (advanced options), settings panels, Accordion.
