# Cynosure brand assets

This directory contains the Cynosure UI brand mark and every derivative surface. All source files are authored as SVG; PNG/ICO binaries are generated from those sources.

## Files

| File | Use |
|---|---|
| `cynosure-mark.svg` | Master full-color mark. Default choice. |
| `cynosure-mark-mono.svg` | `currentColor` monochrome — use on themed / colored / photographic backgrounds. |
| `cynosure-mark-favicon.svg` | 5-token simplified variant for sizes < 32px. |
| `cynosure-lockup.svg` | Horizontal mark + wordmark. Use wherever the mark appears next to other logos. |
| `favicon.ico` | Multi-res ICO (16 + 32 + 48). |
| `apple-touch-icon.png` | 180×180. iOS home-screen icon. |
| `og-image.png` | 1200×630. Open Graph / Twitter share card. |

## Regenerating the binaries

```bash
pnpm brand:generate
```

`favicon.ico`, `apple-touch-icon.png`, and `og-image.png` are rebuilt from the SVG sources via `brand/generate.mjs`. The generator is idempotent.

## Usage rules

**Clear space.** Keep 1 cardinal-token unit (≈10% of mark width) of empty space on every side of the mark.

**Minimum sizes.**
- Full mark: 24px
- Favicon variant: 16px

**Do.**
- Use `cynosure-mark-mono.svg` on non-standard backgrounds — the browser inherits `currentColor`.
- Use the lockup (`cynosure-lockup.svg`) whenever the mark appears alongside other logos.
- Use the favicon variant in browser-tab and 16px contexts.

**Don't.**
- Recolor individual tokens.
- Rotate, skew, outline, or apply drop shadows to the mark.
- Place the full-color mark on busy photography — use the monochrome variant.
- Change the center token's gradient direction or colors.

## Palette

- Iris blue (diagonal tokens): `#8b9dff`
- Violet (cardinal tokens): `#c77dff`
- Center: gradient `#f5f6fa → #c77dff` at ≥64px; flat `#e8ecff` below.
- Monochrome opacity steps: cardinals `0.45`, diagonals `0.7`, center `1`.
