# FileUpload — visual refresh

**Date:** 2026-04-21
**Status:** Design approved, pending implementation plan
**Scope:** Visual polish and one additive prop. No behavioral changes.

## Goal

Make `FileUpload` feel nicer and more versatile without breaking existing consumers. Add a `variant` system so the same component fits primary upload flows, settings cards, dense forms, and inline toolbars.

## Non-goals

- Upload progress, status, retry, or abort.
- Summary footer (total size / clear-all).
- Drag-to-reorder.
- Bulk selection.
- New public sub-components.

## API changes

### `FileUploadProps`

Add one optional prop:

```ts
variant?: 'default' | 'card' | 'compact' | 'minimal'  // default: 'default'
```

Existing consumers pass nothing and get `'default'`, which is a nicer version of today's layout. Fully backwards compatible.

### `FileUploadListProps`

Add one optional prop:

```ts
onPreview?: (file: File, index: number) => void
```

When provided, the row renders a preview `IconButton` (Eye icon) before the remove button. When absent, only the remove button renders — identical to today.

### `FileUploadContext`

Extend the context to carry `variant` so `FileUploadTrigger` can read it without prop drilling.

## Drop zone — four variants

All variants share:

- Drag-over state: accent border + soft tint (`data-over="true"`).
- `:focus-visible` ring on the outer drop-zone role.
- `aria-disabled` styling (reduced opacity, not-allowed cursor).
- Whole surface is a drop target.
- Keyboard activation via Enter / Space (existing behavior).

They differ only in resting layout:

- **`default`** — dashed box, soft-tinted circular icon (`background.accent.soft`, `foreground.accent`), "Drop files to upload" title (`Text size="md" weight="semibold"`), "or" divider line, primary solid **Browse files** `Button`, hint line with accept/size copy in `foreground.muted`.
- **`card`** — solid bordered surface using `background.surface` + `border.subtle`, horizontal `Inline` layout, tinted rounded icon tile on the left, title + hint stacked in the middle, outline variant **Browse** button on the right. No dashed outline.
- **`compact`** — single dashed row, small neutral icon, inline copy ("Drop a file — or click browse · max 10 MB") truncated, outline **Browse** button on the right.
- **`minimal`** — button-shaped dashed trigger only, upload icon + "Attach file" text. Whole element is both the drop target and the browse button.

Variant styling lives in `FileUpload.css.ts` as a `styleVariants` map keyed by variant name. `FileUploadTrigger` reads `variant` from context and renders the appropriate inner layout; CSS picks up the variant via a `data-variant` attribute on the outer element.

## File row — richer treatment

Row is composed entirely from cynosure primitives: `Inline`, `Stack`, `Text`, `Badge`, `IconButton`.

### Thumbnail (44×44, `radius.md`)

- `image/*` files: image preview (existing `URL.createObjectURL` flow, unchanged).
- All other files: doc-style tile with a colored `Badge` (variant `soft`, size `xs`) displaying the extension in uppercase (`PDF`, `DOCX`, `ZIP`, …).

Extension → Badge color mapping:

| Extension group | Badge color |
|---|---|
| `pdf` | `danger` |
| `doc`, `docx` | `info` |
| `xls`, `xlsx`, `csv`, `numbers` | `success` |
| `zip`, `tar`, `gz`, `7z`, `rar` | `warning` |
| `ppt`, `pptx`, `key` | `warning` |
| anything else | `neutral` |

Mapping lives in a small pure function next to `iconForFile`. If the file has no extension, falls back to `neutral` and shows the existing lucide glyph instead of a text badge.

### Body

- Filename: `Text size="sm" weight="medium" truncate`.
- Meta row (`Inline gap="1" align="center"`):
  - Soft neutral `Badge` (size `xs`) with the formatted size (`2.4 MB`), tabular-nums.
  - Muted `Text size="xs" color="fg.muted"` with a human-readable type descriptor (`Image · JPEG`, `Document`, `Archive`, etc.) derived from MIME type.
  - A tiny dot separator (`<span aria-hidden="true">·</span>` or a 2px circle span) between the two.

### Actions

Right-aligned `Inline gap="1"`:

- When `onPreview` is provided: preview `IconButton` (Eye icon, variant `ghost`, size `xs`, `aria-label={`Preview ${file.name}`}`).
- Always: remove `IconButton` (X icon, variant `ghost`, size `xs`, existing `aria-label`). Hover state tints toward danger — implemented via a new modifier class on top of the existing `IconButton` ghost styles.

### Row hover

Border lifts from `border.subtle` to `border.default`. Background stays put. Transition uses existing `vars.duration.fast`.

## Accessibility

- Drop zone keyboard handlers (`Enter` / `Space`) unchanged.
- Browse button in `default` / `card` / `compact` / `minimal` is a real `<button>` nested inside the `role="button"` drop zone. The inner button stops click propagation so a click doesn't fire both handlers. The outer role still handles drop and keyboard activation; the inner button handles mouse click. This produces two accessible names in the a11y tree, which is the desired behavior: screen-reader users hear "Drop zone … Browse files, button".
- Hint copy is linked to the outer drop zone via `aria-describedby` so accept/size info is announced with the zone.
- `Badge` in the thumbnail is `aria-hidden="true"` (the filename already conveys the type).
- IconButtons keep their existing `label` / `aria-label`.
- `aria-live="polite"` on the list is unchanged.

## Files touched

- `packages/react/src/forms/FileUpload/FileUpload.tsx` — thread `variant` through context; render variant-specific drop-zone markup; row layout changes; `onPreview` plumbing.
- `packages/react/src/forms/FileUpload/FileUpload.css.ts` — variant style map, refined row styles (hover, thumb, doc tile), extension-color helpers, danger-hover modifier for remove button.
- `packages/react/src/forms/FileUpload/context.ts` — add `variant` to context type.
- `packages/react/src/forms/FileUpload/FileUpload.stories.tsx` — stories per variant plus an `onPreview`-wired story.
- Tests — existing behavioral tests should pass unchanged; add render smoke tests for each variant and for `onPreview` button presence/absence.

## Risks & open questions

- **Inner button + outer role="button"**: this is the documented pattern we already use, but doubling click handlers needs care. Mitigation: `stopPropagation` on the inner button; the existing drop-zone click handler still fires file-picker for clicks anywhere else on the zone.
- **Type-descriptor strings** (`Image · JPEG`, `Document`, `Archive`, `Spreadsheet`, `Code`, `Audio`, `Video`) — not localized. Consistent with the rest of the component's existing English strings; i18n is a separate concern across the library.
- **Danger-hover on IconButton**: we don't want to add a public `tone="danger"` prop to IconButton for this one case. Implementation uses a local CSS class applied via `className` on the remove button only.

## Acceptance

- All four variants render correctly in Storybook at default and disabled states, with drag-over visuals.
- File row renders both image previews and ext-badged doc tiles correctly for at least: JPG, PNG, PDF, DOCX, XLSX, ZIP, unknown.
- `onPreview` fires with the correct file on click; omitting it removes the button.
- Existing FileUpload tests pass unchanged.
- Keyboard activation and drop handling work identically to today.
