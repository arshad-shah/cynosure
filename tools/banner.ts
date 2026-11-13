/** What the build knows of an output module: its name and the modules it imports at runtime (externals included). */
export type BannerChunk = { name: string; imports: readonly string[] };

/**
 * `"use client"` for modules that run React (hooks, context, JSX), decided from what the module imports: a module that
 * never imports react or react-dom (tokens, `themeInitScript`, `qrToSvg`, the zoom maths, icons, adapters) stays usable
 * in React Server Components. Type-only imports are erased before the build sees them.
 */
export function clientBanner(chunk: BannerChunk): string {
  return chunk.imports.some((id) => /^react(-dom)?($|\/)/.test(id)) ? '"use client";' : "";
}
