# Build-tool adapters

Cynosure needs no plugin: import `@arshad-shah/cynosure/styles.css` (or per-component `styles/<name>.css`) and the components. For shadow roots use `@arshad-shah/cynosure/styles.inline` (`css` string or `createStyleSheet()`).

Adapters are optional conveniences in `src/adapters/<tool>/`: inject a product theme at build time, include only used components' CSS, provide the inline CSS for extension shadow roots. **Contract:** one factory export, no runtime cost in the product bundle, a contract test, and a section here. Status: `vite` stub (implemented in Plan 2); esbuild/extforge and Astro to follow when a product needs them.
