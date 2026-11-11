/**
 * The sentences that say which version a page shows. Everything on a page (examples, props, styles) is built from
 * one commit of the repository, so there is one thing to say: either that commit is the published version, or it is
 * ahead of it. Kept as plain functions so the wording is tested (`tests/unit/site-provenance.test.ts`).
 */
export interface Provenance {
  /** The product's name, e.g. "Cynosure". */
  name: string;
  /** The npm package, e.g. "@arshad-shah/cynosure". */
  package: string;
  /** The version in the repository: the published one, or the last published one when changes are pending. */
  version: string;
  /** True when the repository holds changes that are not released yet. */
  unreleased?: boolean | undefined;
  /** The commit the site was built from, when known. */
  commit?: string | undefined;
}

const built = (commit: string | undefined) => (commit ? ` (commit ${commit})` : "");

/** Under a component's examples: what they run. */
export function examplesNote(site: Provenance): string {
  return site.unreleased
    ? `These examples run unreleased changes${built(site.commit)}. The published version is ${site.version}.`
    : `These examples run ${site.name} ${site.version}${built(site.commit)}, the version on npm.`;
}

/** Under a props table: where it was read from. */
export function propsNote(site: Provenance): string {
  return site.unreleased
    ? `Generated from the type definitions of unreleased changes${built(site.commit)}. ${site.package} on npm is ${site.version}.`
    : `Generated from the type definitions in ${site.package} ${site.version}.`;
}
