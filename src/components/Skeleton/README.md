# Skeleton

A placeholder in the shape of content that is still loading: lines of text, a card or image block, an avatar circle. It keeps the layout steady, so nothing jumps when the content arrives.

```tsx
import { Skeleton } from "@arshad-shah/cynosure";

<section aria-busy={loading} aria-label="Profile">
  {loading ? (
    <>
      <Skeleton shape="circle" />
      <Skeleton lines={3} />
    </>
  ) : (
    <Profile user={user} />
  )}
</section>;
```

| Prop                  | Default | Notes                                                                                |
| --------------------- | ------- | ------------------------------------------------------------------------------------ |
| `shape`               | `text`  | `text` (lines) · `block` (a box) · `circle` (an avatar)                              |
| `lines`               | `1`     | Text only. The last of several lines is shorter, like a paragraph                    |
| `size`                | `md`    | Text size the lines stand in for: each line is that text's line height               |
| `width` / `height`    | –       | Any CSS length. Default: full width; a block is one line tall; a circle is two lines |
| `className` / `style` | –       | Layout only                                                                          |
- Hidden from assistive technology (`aria-hidden`). Mark the region that owns it `aria-busy="true"` while it loads, and announce failures in the page.
- A highlight sweeps along the reading direction (right to left in right-to-left text) and stops under reduced motion.
- A text skeleton has the same height as the text it replaces at the same `size`.

## Tokens

- `--cy-skeleton-color`: placeholder fill (default: a translucent ink tint, so it shows on any surface)
- `--cy-skeleton-highlight`: the sweeping band
- `--cy-skeleton-radius`: corners of text lines and blocks

## Used by

Lists, cards and panels that load data in the web apps and extensions (cross-product audit, 2026-11-10), in place of their own loading placeholders.
