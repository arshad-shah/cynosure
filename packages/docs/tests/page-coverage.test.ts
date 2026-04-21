import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPECTED_COMPONENT_SLUGS } from '../src/lib/components-manifest';

describe('component page coverage', () => {
  for (const slug of EXPECTED_COMPONENT_SLUGS) {
    it(`has an MDX page for ${slug}`, () => {
      const p = resolve(__dirname, `../src/content/docs/components/${slug}/index.mdx`);
      expect(existsSync(p), `missing ${p}`).toBe(true);
    });
  }
});
