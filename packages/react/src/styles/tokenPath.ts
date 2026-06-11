/**
 * Map a token path (the nested key sequence in the design-token tree) to the
 * kebab-case tail of its CSS custom property — i.e. everything after the
 * `--cynosure-` prefix.
 *
 * Mirrors the `name/kebab` transform Style Dictionary applies when it emits the
 * token CSS, so a path resolves to exactly the same custom-property name the
 * tokens package generates. Shared by the typed `vars` contract (`vars.css.ts`)
 * and the `defineTheme` authoring helper so both stay in lockstep.
 *
 * @example toCssName(['color', 'accent', 'onSolid']) // 'color-accent-on-solid'
 */
export const toCssName = (path: string[]): string =>
  path
    .map((seg) =>
      seg
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\./g, '-')
        .toLowerCase(),
    )
    .join('-');

/** The shared custom-property prefix for every Cynosure design token. */
export const TOKEN_PREFIX = 'cynosure';

/** Full CSS custom-property name (incl. `--cynosure-` prefix) for a token path. */
export const toCssVarName = (path: string[]): string => `--${TOKEN_PREFIX}-${toCssName(path)}`;
