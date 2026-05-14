import { DOC_COMPONENT_SLUGS } from '../../../../components.config.mjs';

/**
 * Slugs of every component that ships with a docs page under
 * `src/content/docs/components/<slug>/index.mdx`. Derived from the repo-root
 * `components.config.mjs` manifest so this list stays in lockstep with the
 * react package's published subpaths.
 */
export const EXPECTED_COMPONENT_SLUGS = DOC_COMPONENT_SLUGS as readonly string[];
export type ComponentSlug = (typeof EXPECTED_COMPONENT_SLUGS)[number];
