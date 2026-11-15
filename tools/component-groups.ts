/**
 * The component groups the root README lists under "## Components" (`- **Controls:** Button, IconButton, …`). They are
 * the one source for where a component sits: its Storybook title is `Components/<group>/<Name>` (`cy check` enforces
 * it) and the documentation site groups its navigation the same way. Foundations and Theme are not component groups.
 */
export const COMPONENT_GROUPS = ["Controls", "Structure", "Overlays", "Feedback and display"] as const;
export type ComponentGroup = (typeof COMPONENT_GROUPS)[number];

/** Each listed component's group, read from the README text. Notes in brackets and backticks are ignored. */
export function componentGroups(readme: string): Map<string, ComponentGroup> {
  const section = readme.split(/^## Components\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const groups = new Map<string, ComponentGroup>();
  for (const [, label, list] of section.matchAll(/\*\*([A-Z][A-Za-z ]+):\*\*\s*([^\n*]+)/g)) {
    if (!(COMPONENT_GROUPS as readonly string[]).includes(label as string)) continue;
    for (const item of (list ?? "").replace(/\([^)]*\)/g, "").split(/[,;]/)) {
      const name = item.trim().replace(/\.$/, "").split(/\s+/)[0] ?? "";
      if (/^[A-Z][A-Za-z0-9]*$/.test(name)) groups.set(name, label as ComponentGroup);
    }
  }
  return groups;
}

/** Storybook's id for a title: lower case, every run of other characters one hyphen ("Feedback and display/Badge"). */
export function storybookId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
