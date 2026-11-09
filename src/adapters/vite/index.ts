/** Optional Vite adapter. Filled in by a later plan; the package works without it. */
export interface CynosureVitePlugin {
  name: "cynosure";
}

export function cynosure(): CynosureVitePlugin {
  return { name: "cynosure" };
}
