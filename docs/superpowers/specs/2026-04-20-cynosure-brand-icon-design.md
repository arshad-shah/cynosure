# Cynosure brand icon — design

**Date:** 2026-04-20
**Status:** Draft — awaiting review

## Goal

Give Cynosure UI a distinctive, production-grade visual identity: a single SVG mark plus the surrounding artifacts needed to apply it everywhere the library is seen (Storybook, README, favicons, social share cards).

## Concept

The word *cynosure* means the North Star — and figuratively, the center of attention. The chosen direction translates that second meaning into a systematic, developer-native mark: **a radial of rounded squares ("tokens") that shrink as they radiate outward from a larger center token.** It reads as convergence of attention, but also literally evokes the W3C DTCG design tokens that sit at the core of the library.

Rejected alternatives (for the record, so future redesigns don't retread): literal 4-point star (crowded category), concentric-ring focal point (reads as a target), Ursa Minor constellation (too detailed at favicon size), crescent-C monogram (not abstract enough), prism/gem (premium but metaphorically off-center), beacon (too narrative), typographic "y" (too quiet).

## The mark

### Geometry

All coordinates on a 100×100 viewBox.

| Role | Count | Size | Corner radius | Position |
|---|---|---|---|---|
| Cardinal tokens | 4 | 8×8 | 2 | `(46,2) (46,90) (2,46) (90,46)` |
| Diagonal tokens | 4 | 16×16 | 4 | `(18,18) (66,18) (18,66) (66,66)` |
| Center | 1 | 28×28 | 6 | `(36,36)` |

Rule of thumb: corner radius = side ÷ 4, rounded. This keeps all tokens visually consistent at the "token" feel — soft enough to not read as pixels, crisp enough to not read as blobs.

### Palette

- **Diagonal tokens:** `#8b9dff` (iris blue)
- **Cardinal tokens:** `#c77dff` (violet)
- **Center:** linear gradient `#f5f6fa → #c77dff` (135°) at ≥64px; flat `#e8ecff` below 64px

Rationale: two brand hues from the existing token palette vocabulary, plus a white-to-violet gradient that resolves convergence at hero sizes. The gradient is dropped at small sizes because it muddies at rasterization — a flat near-white reads crisper.

### Size behaviour

| Size | Treatment |
|---|---|
| ≥ 64px | Full 9-token mark, gradient center |
| 32–63px | Full 9-token mark, flat center |
| 16–31px | **Simplified 5-token mark:** drop the 4 cardinals, keep center + 4 diagonals; corner radius reduced to 2; `shape-rendering="crispEdges"` on the SVG |

The cardinal tokens (8px at full scale = 0.8px at 16px) vanish into a single pixel at favicon size and read as noise. Dropping them preserves the radial feel without the artifact.

### Monochrome variant

Same geometry with `fill="currentColor"` and opacity steps:

- Cardinals: `opacity="0.45"`
- Diagonals: `opacity="0.7"`
- Center: `opacity="1"`

Used on colored backgrounds, in the terminal theme, in print, and anywhere the two-hue version would clash.

## Wordmark

- Typeface: **Inter Tight** (fallback: Inter, system-ui)
- Weight: 600
- Case: lowercase `cynosure`
- Tracking: `-0.02em`
- Color: `#f5f6fa` on dark, `#0b0d12` on light

### Lockup

Mark sits to the left of the wordmark. Vertical alignment: mark height equals cap-height × 1.35 (so the mark visually balances the lowercase x-height + descender of `y`). Gap between mark and wordmark: 0.4 × mark-height.

Only one lockup form ships: horizontal. No vertical stack (YAGNI — nothing in this project needs it).

## Deliverables

All assets live in a new `brand/` directory at the repo root.

| File | Format | Purpose |
|---|---|---|
| `brand/cynosure-mark.svg` | SVG | Master full-color mark |
| `brand/cynosure-mark-mono.svg` | SVG | `currentColor` monochrome variant |
| `brand/cynosure-mark-favicon.svg` | SVG | Simplified 5-token variant for small sizes |
| `brand/cynosure-lockup.svg` | SVG | Horizontal mark + wordmark |
| `brand/favicon.ico` | ICO | Multi-res ICO (16 + 32 + 48), generated from the favicon SVG |
| `brand/apple-touch-icon.png` | PNG | 180×180, opaque dark background, generated from master mark |
| `brand/og-image.png` | PNG | 1200×630 social share card |
| `brand/README.md` | MD | Usage rules (clear space, min size, do/don't) |

PNG/ICO generation is done by a Node script (`brand/generate.mjs`) using `sharp` and `to-ico`, added as root `devDependencies`. The script is idempotent and checked into git; the generated binaries are also committed (so contributors don't need to run it).

### Usage rules (baked into `brand/README.md`)

- **Clear space:** 1 cardinal-token unit (≈10% of mark width) on every side.
- **Minimum size:** 16px for the simplified favicon; 24px for the full mark.
- **Don't:** recolor individual tokens, rotate, skew, outline, or apply drop shadows; don't place the full color mark on busy photography (use monochrome).
- **Do:** use `currentColor` monochrome on non-standard backgrounds; use the lockup whenever the mark appears next to other logos.

## Rollout — where the brand gets applied

1. **Storybook manager** (`.storybook/manager.ts`) — set `brandImage` to the lockup SVG; keep `brandTitle` as fallback for screen readers.
2. **Storybook manager head** (new file `.storybook/manager-head.html`) — wire `<link rel="icon">` chain (SVG + ICO + apple-touch-icon) and Open Graph / Twitter meta tags pointing at `og-image.png`.
3. **Storybook preview head** (new file `.storybook/preview-head.html`) — same favicon chain so the canvas tab also shows the mark.
4. **README.md** — replace the current plain `# Cynosure UI` heading with a centered mark + wordmark at the top. Keep the tagline and badges below.
5. **`package.json`** (root + `packages/react`) — add `"icon": "brand/cynosure-mark.svg"` field so npm/registries pick it up where supported.

The brand assets themselves and the rollout wiring are part of the same spec; the implementation plan will split them into two phases (assets first, wiring second).

## Out of scope

- Animated variants
- Vertical lockup
- Per-theme recolored mark variants (monochrome covers all themes via `currentColor`)
- Social avatar crops
- Marketing site beyond Storybook (no separate docs site exists in this repo)
- Logo history / brand book beyond the single `brand/README.md`

## Success criteria

- A visitor to Storybook sees the mark in the browser tab and the Storybook sidebar header.
- A visitor to the GitHub README sees the mark at the top of the page.
- Someone sharing a Storybook URL on Twitter/Slack/GitHub gets a branded OG card.
- The mark renders crisply at 16px in a browser tab on both macOS and Windows.
- `brand/README.md` gives anyone a clear set of rules for applying the mark in new surfaces.
