/**
 * Named themes: a theme a person picks by name (Cynosure, Midnight, a plugin's theme), described as plain JSON so it can
 * be saved, shipped by a plugin and checked at runtime. A definition is a `ThemeInput` plus an id and a name; `mode`
 * fixes it to light or dark so the colour-mode switch does not flip it. Nothing here touches the page: apply a theme with
 * `<CynosureTheme theme={…}>` or `themeToCss`.
 */
import { CynosureThemeError, contrastRatio } from "./color.js";
import { createTheme } from "./create-theme.js";
import { BASE_GLOBAL } from "./defaults.js";
import type { PaletteName, Theme, ThemeInput, ThemeMode } from "./schema.js";

/** A theme as plain, serialisable data: what a plugin ships and what an app saves. */
export interface ThemeDefinition extends ThemeInput {
  /** Stable id: lower-case letters, digits and hyphens, starting with a letter (`midnight`, `acme-dusk`). */
  id: string;
  /** The name people see in a theme picker. */
  name: string;
}

/** A checked definition and the theme built from it. */
export interface NamedTheme {
  /** The definition's id. */
  id: string;
  /** The definition's name. */
  name: string;
  /** `light` or `dark` for a theme fixed to one mode; undefined when it follows the colour mode. */
  mode?: ThemeMode;
  /** The definition as given (serialise it with `JSON.stringify`). */
  definition: ThemeDefinition;
  /** The built theme, for `<CynosureTheme theme>`, `themeToCss` and the editor and chart themes. */
  theme: Theme;
}

const ID = /^[a-z][a-z0-9-]*$/;
function fail(message: string): never {
  throw new CynosureThemeError(`Cynosure theme ${message}`);
}
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Checks `value` has the shape of `base`: the same keys (or fewer) and the same type at every leaf. */
function like(value: unknown, base: unknown, path: string): void {
  if (!isObject(base)) {
    if (typeof value !== typeof base) fail(`${path} must be a ${typeof base}.`);
    return;
  }
  if (!isObject(value)) fail(`${path} must be an object.`);
  for (const [k, v] of Object.entries(value as object)) {
    if (!Object.hasOwn(base, k)) fail(`${path}.${k} is not a Cynosure token.`);
    like(v, base[k], `${path}.${k}`);
  }
}

/** Checks a map of maps (palettes, components) holds only strings or numbers, and `seriesColors` a list of strings. */
function mapOfMaps(value: unknown, path: string): void {
  if (!isObject(value)) fail(`${path} must be an object.`);
  for (const [name, entries] of Object.entries(value as object)) {
    if (!isObject(entries)) fail(`${path}.${name} must be an object.`);
    for (const [k, v] of Object.entries(entries as object)) {
      const ok =
        k === "seriesColors"
          ? Array.isArray(v) && v.every((c) => typeof c === "string")
          : typeof v === "string" || typeof v === "number";
      if (!ok) fail(`${path}.${name}.${k} must be a string.`);
    }
  }
}

const skip = () => {};
/** How each field of a definition is checked (mode, like every value, is checked by createTheme). */
const FIELDS: Record<string, (value: unknown, path: string) => void> = {
  id: skip,
  name: skip,
  mode: skip,
  accent: (v, path) => like(v, "", path),
  radius: (v, path) => like(v, 1, path),
  scale: (v, path) => like(v, typeof v === "number" ? 1 : "", path),
  font: (v, path) => like(v, { sans: "", mono: "", display: "" }, path),
  motion: (v, path) => like(v, v === "reduced" ? v : BASE_GLOBAL.motion, path),
  tokens: (v, path) => like(v, { ...BASE_GLOBAL, scale: 1 }, path),
  palettes: mapOfMaps,
  components: mapOfMaps,
};

/** Checks the definition's shape: only known fields, each of the right type. Values are checked by createTheme. */
function checkShape(input: unknown): ThemeDefinition {
  if (!isObject(input)) return fail("definitions must be an object.");
  if (typeof input.id !== "string" || !ID.test(input.id))
    fail(`id must be lower-case letters, digits and hyphens: got ${JSON.stringify(input.id)}.`);
  if (typeof input.name !== "string" || !input.name.trim()) fail(`"${input.id}" needs a name.`);
  for (const [key, value] of Object.entries(input)) {
    const check = Object.hasOwn(FIELDS, key) ? FIELDS[key] : undefined;
    if (!check) fail(`"${input.id}".${key} is not a theme field.`);
    else check(value, `"${input.id}".${key}`);
  }
  return input as unknown as ThemeDefinition;
}

/** The text pairs every palette a theme shows must read at 4.5:1. */
const PAIRS = [
  ["ink", "bg"],
  ["ink", "surface"],
  ["ink", "surfaceRaised"],
  ["muted", "surface"],
  ["onAccent", "accent"],
] as const;

/** Rejects a theme whose text would not read: the check a plugin theme cannot skip. */
function checkContrast(id: string, theme: Theme): void {
  const shown: PaletteName[] = theme.mode
    ? [theme.mode, `${theme.mode}-contrast`]
    : ["light", "dark", "light-contrast", "dark-contrast"];
  for (const name of shown) {
    const p = theme.palettes[name];
    for (const [text, on] of PAIRS) {
      const ratio = contrastRatio(p[text], p[on]);
      if (ratio < 4.5)
        fail(`"${id}", ${name} palette: ${text} reads ${ratio.toFixed(2)}:1 on ${on}; text needs 4.5:1.`);
    }
  }
}

/**
 * Checks a theme definition (typically JSON from a plugin or from storage) and builds it. Throws CynosureThemeError for
 * an unknown field, a value of the wrong type, an invalid or unsafe value, or text that would not read at 4.5:1.
 */
export function defineTheme(input: unknown): NamedTheme {
  const definition = checkShape(input);
  const theme = createTheme(definition);
  checkContrast(definition.id, theme);
  const { id, name, mode } = definition;
  return { id, name, ...(mode ? { mode } : {}), definition, theme };
}

/** The named themes an app offers: its own plus any registered at runtime (plugins). */
export interface ThemeRegistry {
  /** Checks and adds a theme, replacing (in place) one with the same id. Throws CynosureThemeError for bad input. */
  register(definition: unknown): NamedTheme;
  /** Removes a theme. Returns whether it was registered. */
  unregister(id: string): boolean;
  /** The theme with this id, if registered. */
  get(id: string): NamedTheme | undefined;
  /** Every registered theme, in registration order. The same array until something changes. */
  list(): readonly NamedTheme[];
  /** Calls `listener` after every change; returns the function that stops it. Fits `useSyncExternalStore`. */
  subscribe(listener: () => void): () => void;
}

/** A registry of named themes, starting with `initial` (checked like any other registration). */
export function createThemeRegistry(initial: readonly unknown[] = []): ThemeRegistry {
  const themes = new Map<string, NamedTheme>();
  const listeners = new Set<() => void>();
  let list: readonly NamedTheme[] = [];
  const changed = () => {
    list = [...themes.values()];
    for (const listener of [...listeners]) listener();
  };
  const registry: ThemeRegistry = {
    register(definition) {
      const named = defineTheme(definition);
      themes.set(named.id, named);
      changed();
      return named;
    },
    unregister(id) {
      const had = themes.delete(id);
      if (had) changed();
      return had;
    },
    get: (id) => themes.get(id),
    list: () => list,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  for (const definition of initial) registry.register(definition);
  return registry;
}
