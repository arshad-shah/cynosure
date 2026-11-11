import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

/**
 * The site's content is the repository's own documentation, read where it lives: nothing is copied into site/, so a
 * correction is made once, in the source file.
 */
const guides = defineCollection({ loader: glob({ base: "../docs", pattern: "*.md" }) });
const readmes = defineCollection({
  loader: glob({
    base: "../src",
    pattern: ["components/*/README.md", "foundations/*/README.md"],
    generateId: ({ entry }) => entry.split("/")[1] as string,
  }),
});
const root = defineCollection({ loader: glob({ base: "..", pattern: ["README.md", "CHANGELOG.md"] }) });

export const collections = { guides, readmes, root };
