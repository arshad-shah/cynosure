---
"@arshad-shah/cynosure-react": minor
"@arshad-shah/cynosure-tokens": minor
---

Replace the Radix menu packages with a first-party menu engine, modernize the
visual foundation, and route all component styling through tokens.

- **Menus:** drop `@radix-ui/react-{dropdown-menu,context-menu,menubar,navigation-menu}`
  in favour of an in-tree, headless menu engine (roving focus, type-ahead,
  submenus, checkbox/radio items, dismissal, focus return). Public component API
  is unchanged. The package is now Radix-free.
- **Foundation:** rounder radius scale, softer multi-layer shadows, and refined
  motion easings/durations. `easing` is now exposed on the token contract and
  every component's motion + focus rings flow from the token foundation (no
  hardcoded curves, durations, or focus-ring geometry).
- **Fixes:** Blockquote left rule now spans wrapped lines; Slider tick marks
  position correctly; FileUpload remove button sits at the row's end; PinInput
  mask renders a filled dot; Accordion chevron rotates when open; Tooltip no
  longer flashes at the top-left before positioning.
