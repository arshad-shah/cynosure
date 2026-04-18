# Phase 08 — Forms (advanced)

> **Goal:** The hard form controls. Each one leans heavily on React Aria Components for correctness.

**Depends on:** Phases 01–07.
**Blocks:** Phase 13 (form composition).

---

## Components

1. **`Select`** — single-select dropdown
2. **`Combobox`** — filterable select (autocomplete)
3. **`MultiSelect`** — multi-value select with tag display
4. **`Slider`** / **`RangeSlider`**
5. **`DatePicker`** / **`DateRangePicker`** / **`TimePicker`**
6. **`ColorPicker`**
7. **`FileUpload`**
8. **`SearchInput`**
9. **`PinInput`** (OTP)
10. **`TagsInput`**
11. **`Rating`**

---

## Strategy: leverage React Aria Components

For anything involving popovers, listboxes, virtualisation, or complex keyboard navigation: **use React Aria Components as the base** and style with vanilla-extract. Rolling your own here invites bugs around touch, screen readers, virtualised focus, RTL, and i18n.

```bash
pnpm --filter @arshad-shah/cynosure-react add react-aria-components @internationalized/date
```

Pattern per component:

```tsx
// Select.tsx
import { Select as AriaSelect, Button, ListBox, ListBoxItem, Popover, SelectValue } from 'react-aria-components';
import * as styles from './Select.css.js';

export function Select({ label, children, ...rest }: SelectProps) {
  return (
    <AriaSelect className={styles.root} {...rest}>
      {label && <Label>{label}</Label>}
      <Button className={styles.trigger}>
        <SelectValue />
        <ChevronDownIcon />
      </Button>
      <Popover className={styles.popover}>
        <ListBox className={styles.listbox}>
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>((props, ref) => (
  <ListBoxItem ref={ref} className={styles.item} {...props} />
));
```

We re-skin, we don't reinvent. All our effort is in:
- Typed `variant`/`size` props layered on top
- Consistent styling via our tokens
- Consumer-friendly API (the same `FormControlBase` contract)
- Integration with `Form`/`FormField` in Phase 13

---

## `Select`

```tsx
<Select label="Country" value={country} onValueChange={setCountry} size="md" variant="outline">
  <SelectItem value="gb">United Kingdom</SelectItem>
  <SelectItem value="ie">Ireland</SelectItem>
  <SelectItem value="us">United States</SelectItem>
</Select>
```

### Props
- Extends `FormControlBase<string>`
- `placeholder?: string`
- `items?: Array<{ value: string; label: ReactNode; section?: string; disabled?: boolean }>` — render from data instead of JSX children

### Sections

```tsx
<Select label="Framework">
  <SelectSection title="React">
    <SelectItem value="next">Next.js</SelectItem>
    <SelectItem value="remix">Remix</SelectItem>
  </SelectSection>
  <SelectSection title="Vue">
    <SelectItem value="nuxt">Nuxt</SelectItem>
  </SelectSection>
</Select>
```

---

## `Combobox`

Autocomplete — user types to filter a list.

```tsx
<Combobox
  label="Assignee"
  value={user}
  onValueChange={setUser}
  items={users}
  allowsCustomValue={false}
>
  {user => <ComboboxItem value={user.id}>{user.name}</ComboboxItem>}
</Combobox>
```

Use React Aria's `ComboBox` with `Input`, `Popover`, `ListBox`. Features:
- Async loading (consumer provides `onInputChange`)
- `allowsCustomValue` for free-form entries
- Empty state rendering via `<ComboboxEmpty>`
- Highlight matching substring in items (via `<ComboboxItemLabel>`)

---

## `MultiSelect`

Tag-based multi-select. Selected values appear as `Tag`s inside the trigger; typing filters the dropdown; arrow-down opens; backspace removes last tag.

```tsx
<MultiSelect
  label="Skills"
  value={skills}
  onValueChange={setSkills}
  items={allSkills}
  maxSelected={5}
/>
```

React Aria has `ListBox selectionMode="multiple"` — build around that, plus a tags-rendering trigger.

---

## `Slider` / `RangeSlider`

Use React Aria's `Slider` and `SliderThumb`.

```tsx
<Slider label="Volume" defaultValue={50} min={0} max={100} step={1} showValue />
<RangeSlider label="Price" defaultValue={[10, 50]} min={0} max={100} />
```

Props:
- `size?: 'sm' | 'md' | 'lg'`
- `colorScheme?: …` (filled track colour)
- `marks?: Array<{ value: number; label?: string }>` — tick marks
- `showValue?: boolean | 'tooltip'`
- `formatOptions?: Intl.NumberFormatOptions` — passes through to React Aria for locale-aware display

---

## `DatePicker` / `DateRangePicker` / `TimePicker`

Use React Aria's `DatePicker`, `DateRangePicker`, `TimeField`. Backed by `@internationalized/date` — timezone-aware, locale-aware, robust.

```tsx
<DatePicker label="Start date" value={date} onChange={setDate} minValue={today} granularity="day" />
<DateRangePicker label="Stay" value={range} onChange={setRange} />
<TimePicker label="Meeting time" hourCycle={24} />
```

Styling investment: a calendar grid (CalendarCell, CalendarGrid), popover positioning, range selection visuals. Copy Radix/Aria patterns closely for reliability.

---

## `ColorPicker`

Use React Aria's `ColorPicker` suite (`ColorArea`, `ColorSlider`, `ColorSwatch`, `ColorField`).

```tsx
<ColorPicker value={color} onChange={setColor}>
  <ColorPickerTrigger />
  <ColorPickerContent>
    <ColorArea />
    <ColorSlider channel="hue" />
    <ColorField channel="hex" />
  </ColorPickerContent>
</ColorPicker>
```

---

## `FileUpload`

Not covered by React Aria; build ourselves.

```tsx
<FileUpload
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple
  onFilesChange={setFiles}
  onError={setError}
>
  <FileUploadTrigger>Drop files or click to browse</FileUploadTrigger>
  <FileUploadList />
</FileUpload>
```

Features:
- Drag-and-drop (uses native drag events; no heavy dep).
- File validation: size, type, count.
- Error callback with typed reason (`'type' | 'size' | 'count'`).
- Accessible: the drop zone is a button; keyboard accessible; announces accepted files via polite live region.
- Preview thumbnails for images (lazy; via `URL.createObjectURL`).

---

## `SearchInput`

Specialisation of `Input` with `type="search"`, leading search icon, clear button, debounced `onSearch` callback.

```tsx
<SearchInput placeholder="Search docs…" onSearch={query => …} debounceMs={200} />
```

Keyboard: Esc clears; Enter triggers `onSubmit`.

---

## `PinInput`

For OTP codes, 2FA.

```tsx
<PinInput length={6} onComplete={code => verify(code)} mask type="numeric" />
```

Implementation:
- Renders N individual `<input maxLength=1>` elements inside a `Inline` primitive.
- Arrow keys / backspace move focus between fields.
- Paste on any field distributes chars across all fields.
- `mask` replaces rendered chars with `•`.
- `type`: `'numeric'` (inputMode=numeric, pattern), `'alphanumeric'`, `'alphabetic'`.
- Emits a single `onChange(value: string)` of the concatenated value.

---

## `TagsInput`

Free-form tag entry. Enter/comma commits; backspace removes last.

```tsx
<TagsInput value={tags} onValueChange={setTags} suggestions={recentTags} />
```

---

## `Rating`

```tsx
<Rating value={rating} onValueChange={setRating} max={5} allowHalf />
```

Radio-group-style semantics under the hood (using React Aria's `useRadio` primitives, but styled as stars). Keyboard: arrow keys change value.

---

## Testing requirements

- Every component has ≥ 4 stories (default, controlled, invalid, disabled).
- Every component has an interaction test that drives keyboard-only:
  - Select: Tab to trigger → Enter/Space opens → Arrow keys navigate → Enter selects.
  - Combobox: type → Arrow → Enter.
  - Slider: focus thumb → Arrow keys change value.
  - DatePicker: focus → Arrow keys navigate grid → Enter selects.
- A11y stories pass zero violations.
- Locale tests: DatePicker renders correctly with `en-US`, `en-IE`, `ar-SA` (RTL) — three snapshot stories.

---

## Exit criteria

- [ ] All components exist and export through per-component entry points.
- [ ] All use React Aria Components where applicable; zero DIY popovers or comboboxes.
- [ ] Keyboard interaction fully covered by tests.
- [ ] Locale-aware: DatePicker respects `DirectionProvider` and locale (`en-IE` by default for Arshad, configurable via a `LocaleProvider` we add here).
- [ ] Bundle check: `import { DatePicker }` produces ≤ 25 KB gzipped (including React Aria and `@internationalized/date` — these are the big deps; consumers understand).
- [ ] Changesets: `@arshad-shah/cynosure-react` minor "Advanced form controls".

## Decisions to log

- React Aria Components is a hard dependency. Document that `react-aria-components` is ~50 KB gzipped when fully imported, but our per-component entries keep the graph bounded.
- `@internationalized/date` is required for DatePicker and is not polyfillable. Consumers who don't use date pickers don't pay this cost (tree-shaking).
- `LocaleProvider`: a thin wrapper around React Aria's `I18nProvider` so our components get locale. Add to the public API.
