/**
 * Every Facet icon by its name, for code that only has the name as a string: a plugin that declares `icon: "database"`
 * in its manifest, a setting saved as text. Its own entry (`@arshad-shah/cynosure/icons/by-name`), because it brings
 * every icon along: the main entry and `@arshad-shah/cynosure/icons` (one import per icon) stay tree-shaken.
 */
import * as facet from "./facet.js";
import type { ICON_KEYWORDS } from "./keywords.js";
import type { IconData } from "./types.js";

/** A Facet icon's name: kebab-case, as in its `name` field and the gallery ("arrow-up-right"). */
export type IconName = keyof typeof ICON_KEYWORDS;

/** Every Facet icon, keyed by its name ("arrow-up-right"). */
export const icons: Readonly<Record<IconName, IconData>> = Object.freeze(
  Object.fromEntries(Object.values(facet).map((icon) => [icon.name, icon])) as Record<IconName, IconData>,
);

/**
 * The Facet icon with this name ("arrow-up-right", as in its `name` field), or undefined for a name that is not one
 * (an unknown name, or one from another icon set): fall back to an icon of your own.
 */
export function iconByName(name: string): IconData | undefined {
  return Object.hasOwn(icons, name) ? icons[name as IconName] : undefined;
}
