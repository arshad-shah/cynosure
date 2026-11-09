# Migrating a product to Cynosure

Tracked as one issue per product repo (opened after Milestone 2). Order of work in a product:

1. `pnpm add @arshad-shah/cynosure`; import `styles.css` (or `styles.inline` in shadow roots).
2. Wrap the root in `<CynosureTheme theme={createTheme({ accent, scale })}>`; delete the product's own token system.
3. Replace product components with Cynosure ones; replace icons with Facet icons; delete native controls.
4. Anything missing goes into Cynosure (with tests), never back into the product.

| Scope          | Products                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full           | prism, aperture-css, smart-audio-capture, request-interceptor, session-recorder, snapforge, algo-visual (Stepframe), algosnap, whetstone, planr, exposure-map |
| From the start | verql                                                                                                                                                         |
| Partial        | brothers-arcade (overlays), portfolio-v6, nimaz-web (tokens, icons, islands), detent and swiftchart docs (tokens), for-spogmay (tokens, icons)                |
| Archive        | ui-library                                                                                                                                                    |
