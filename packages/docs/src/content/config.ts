import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
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
