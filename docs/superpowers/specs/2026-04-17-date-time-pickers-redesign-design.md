# Date & Time Pickers Redesign

**Date:** 2026-04-17
**Scope:** `@lumen/react` — `DatePicker`, `DateRangePicker`, `TimePicker`
**Status:** Approved — implementation in progress

## Goal

Make the date and time pickers visually polished, visually separated, and
independently evolvable. Add a popup experience to `TimePicker`.

## Decisions

| Area | Decision |
|------|----------|
| DatePicker direction | **B** — Expressive & modern (gradient selection, scale-on-hover, accent-tinted shadow, "Go to today" footer) |
| DateRangePicker direction | **C** — Preset rail + dual-month + keyboard-hint footer |
| TimePicker popup | Wheel columns (hour / minute / period) |
| Range apply behavior | Auto-apply on end-click (no Apply button) |
| Range presets | No built-ins — consumer must supply via `presets` prop |
| TimePicker trigger | Clock icon button (like DatePicker's calendar icon) |
| Hour format | Auto-detect from locale; optional `hourCycle?: 12 \| 24` override |
| Minute step | `minuteStep?: number`, default `1` |
| Combined DateTimePicker | Not building — keep components separate |

## File Structure

```
packages/react/src/forms/
├── Calendar/                       NEW — shared primitives
│   ├── CalendarHeader.tsx
│   ├── Calendar.css.ts             (grid + day cell + header cell styles)
│   └── index.ts
├── DatePicker/
│   ├── DatePicker.tsx
│   └── DatePicker.css.ts           (field + popover + "Go to today" footer)
├── DateRangePicker/
│   ├── DateRangePicker.tsx
│   ├── DateRangePicker.css.ts      (preset rail + dual-month + footer)
│   └── DateRangePickerPresets.tsx
└── TimePicker/
    ├── TimePicker.tsx
    ├── TimePickerWheel.tsx
    └── TimePicker.css.ts
```

Rationale: `DateRangePicker` currently imports 8 classes from
`DatePicker.css.ts`. Extracting shared calendar styles into `Calendar/` breaks
that coupling so each picker can evolve independently.

## API Surface

### DatePicker — no new props

Visual-only changes plus an always-on "Go to today" footer inside the popover.

### DateRangePicker

```ts
interface DateRangePickerOwnProps {
  // existing: label, size, variant, invalid, className, style
  presets?: Array<{ label: string; value: { start: DateValue; end: DateValue } }>;
  visibleMonths?: 1 | 2;   // default 2, auto-collapses to 1 below 640px
}
```

- Auto-apply on end-click; no Apply/Clear buttons.
- Footer: keyboard hints (`↵ select · Esc close`) plus a "Clear" link visible
  only when a range is selected.
- Preset rail only renders when `presets` is supplied.

### TimePicker

```ts
interface TimePickerOwnProps {
  // existing: label, size, variant, invalid, className, style
  hourCycle?: 12 | 24;     // default: locale auto-detect
  minuteStep?: number;     // default 1
}
```

- Clock icon button opens the wheel popover.
- Wheel = 3 scroll-snap columns (hour / minute / period). Period column hidden
  in 24-hour mode.
- Segment typing still works.

## Visual System

All values come from existing `vars` tokens in `styles/vars.css.ts`.

**DatePicker (B):**
- Popover radius: `vars.radius.lg`.
- Popover shadow: accent-tinted lift.
- Selected day: gradient `accent.solid → accent.solidHover` with soft drop
  shadow.
- Day cell hover: `scale(1.04)`, 120ms ease transform.
- Footer: 1px `border.subtle` top, `Today is <date>` left, "Go to today"
  accent-colored link right.

**DateRangePicker (C):**
- Rail: 148px wide, `background.subtle`, right border `border.subtle`. Active
  preset: white surface with inset 1px ring.
- Dual month: CSS grid `1fr 1fr`. Left month has prev-nav only; right month
  has next-nav only.
- In-range cells: `accent.soft`, square corners. Start/end: full accent fill
  rounded on outer side.
- Footer: `kbd` chips in `background.subtle`, right-aligned Clear link.

**TimePicker wheel:**
- Pop width: 230px (12h) / 190px (24h). Wheel area 140px tall with
  `mask-image` fade top/bottom.
- `scroll-snap-type: y mandatory`; center row filled `accent.solid`.

**Shared:**
- Field height bumps to 44px for `md`.
- All icons via `lucide-react` (`CalendarDays`, `ChevronLeft/Right`, `Clock`).
- Cursors per memory guidance.

## Out of scope

- Combined `DateTimePicker` component.
- Built-in preset list for `DateRangePicker`.
- Any token additions to `packages/tokens`.
