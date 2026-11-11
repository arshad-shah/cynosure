import { getCollection } from "astro:content";
import { slug } from "./routes";

export interface CatalogueEntry {
  name: string;
  slug: string;
  kind: "components" | "foundations";
  summary: string;
  /** The README as written: `src/<kind>/<name>/README.md`. */
  source: string;
}

/** Every component and foundation that has a README. */
export async function allEntries(): Promise<(CatalogueEntry & { id: string })[]> {
  const readmes = await getCollection("readmes");
  return readmes.map((r) => {
    const kind = (r.filePath ?? "").includes("/foundations/") ? "foundations" : "components";
    const summary =
      (r.body ?? "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .find((p) => p && !p.startsWith("#") && !p.startsWith("```") && !p.startsWith("|")) ?? "";
    return {
      id: r.id,
      name: r.id,
      slug: slug(r.id),
      kind,
      summary: summary
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[`*_]/g, "")
        .replace(/\s+/g, " "),
      source: `src/${kind}/${r.id}/README.md`,
    };
  });
}

/**
 * The catalogue's groups, read from the root README's "Components" section (one source for both), e.g.
 * `**Controls:** Button, IconButton, …`. Names in the README that have no README of their own (hooks) are left out.
 */
export function groupsFrom(readme: string, known: Set<string>): { label: string; names: string[] }[] {
  const section = readme.split(/^## Components$/m)[1]?.split(/^## /m)[0] ?? "";
  const groups: { label: string; names: string[] }[] = [];
  for (const [, label, list] of section.matchAll(/\*\*([A-Z][A-Za-z ]+):\*\*\s*([^\n*]+)/g)) {
    const names = (list ?? "")
      .replace(/\([^)]*\)/g, "")
      .split(/[,;]/)
      .map((n) => n.trim().replace(/\.$/, "").split(/\s+/)[0] ?? "")
      .filter((n) => known.has(n));
    if (names.length) groups.push({ label: label as string, names });
  }
  return groups;
}
