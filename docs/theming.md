# Theming

```ts
const theme = createTheme({
  accent: "#e8462e", // any hex, rgb(), hsl(), oklch()
  scale: "compact", // compact 0.875 · comfortable 1 · spacious 1.2 · or a number
  radius: 1, // multiplier on the Facet radius (0.3 × control height)
  font: { sans: "Hanken Grotesk, system-ui" },
  motion: "reduced", // or partial durations/easings
  tokens: { space: { "4": 10 } }, // any global token
  palettes: { dark: { bg: "#0f0e0c" } }, // any colour, per palette
  components: { button: { radius: "4px" } }, // any component token
});
```

`createTheme` derives accent hover/active (OKLCH), soft and ring mixes, and on-accent text with WCAG contrast ≥ 4.5:1. Invalid colours or unsafe values throw `CynosureThemeError`.

Apply it: `<CynosureTheme theme={theme} mode="system">`, at build time with `themeToCss(theme)`, or in a shadow root with `styles.inline` plus `themeToCss(theme, ":host")`. Modes: `light | dark | system`; contrast: `normal | more | system`. `useColorMode({ storage })` persists the user's choice.
