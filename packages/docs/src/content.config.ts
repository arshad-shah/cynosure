import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Starlight requires the `docs` collection to use its own loader + schema so
// it can wire routing, sidebar links, breadcrumbs, search, and ToC entries.
// We extend the schema to keep cynosure's existing custom frontmatter fields
// (status / since / a11y / bundleSize / tags / category / order) so existing
// MDX files don't need any rewriting — pages just opt in by reading those
// values from their frontmatter and rendering them however they like.
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      order: z.number().default(0).optional(),
      category: z
        .enum(['home', 'getting-started', 'foundations', 'components', 'recipes', 'changelog'])
        .optional(),
      status: z.enum(['stable', 'beta', 'alpha', 'experimental', 'deprecated']).optional(),
      since: z.string().optional(),
      a11y: z.string().optional(),
      bundleSize: z.string().optional(),
      tags: z.array(z.string()).default([]).optional(),
    }),
  }),
});

export const collections = { docs };
