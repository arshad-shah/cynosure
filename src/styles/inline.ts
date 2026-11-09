import generated from "./generated-css";

/** All Cynosure CSS as a string, for shadow roots and extension `getStyle()` hooks. */
export const css: string = generated;

/** A constructable stylesheet for `shadowRoot.adoptedStyleSheets`. */
export function createStyleSheet(): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
}
