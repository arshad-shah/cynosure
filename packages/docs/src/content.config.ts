import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro 6 requires every collection to declare a loader explicitly. We point at
// the same `src/content/docs/**` tree as before so MDX/MD entries continue to
// resolve at the same routes.
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    category: z.enum([
      'home',
      'getting-started',
      'foundations',
      'components',
      'recipes',
      'changelog',
    ]),
    status: z.enum(['stable', 'beta', 'alpha', 'experimental', 'deprecated']).optional(),
    since: z.string().optional(),
    a11y: z.string().optional(),
    bundleSize: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
