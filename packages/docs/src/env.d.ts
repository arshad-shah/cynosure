/// <reference types="astro/client" />

// Local mirror of the shape of `Astro.locals.starlightRoute` we depend on.
// We don't `/// <reference types="@astrojs/starlight/locals" />` because
// Starlight's locals.d.ts transitively imports `virtual:starlight/*`
// modules that only exist at Astro runtime — `tsc --noEmit` (run in CI
// after `astro check`) can't resolve them and bails. Keeping a hand-rolled
// shape is the smallest type surface that the `PageTitle` override needs.
declare namespace App {
  interface Locals {
    starlightRoute: {
      entry: {
        data: {
          title: string;
          description?: string;
          // Frontmatter fields surfaced by the PageTitle / FrontmatterMeta
          // overrides. Extend here when adding new visible fields.
          status?: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated';
          since?: string;
          a11y?: string;
          bundleSize?: string;
          tags?: string[];
          category?: string;
        };
      };
    };
  }
}

declare module '*?raw' {
  const content: string;
  export default content;
}
declare module '*?url' {
  const url: string;
  export default url;
}
