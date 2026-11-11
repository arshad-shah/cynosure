/** `"use client"` for interactive modules only, so tokens, icons and adapters stay usable in React Server Components. */
export function clientBanner(moduleId: string): string {
  return /^(components|foundations|theme)\//.test(moduleId) ? '"use client";' : "";
}
