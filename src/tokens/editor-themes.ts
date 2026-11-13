/**
 * Code colours for any editor or highlighter, from a Cynosure theme. Editors styled with CSS (CodeMirror 6, Prism,
 * highlight.js, Shiki's css-variables theme) use `styles/syntax.css`, which reads the `--cy-color-syntax-*` tokens and
 * so follows light, dark and contrast by itself. Editors that take a theme object instead (Monaco, Shiki with a
 * TextMate theme, VS Code-style themes) get one built here from resolved colours: build one per palette and switch
 * with the page's mode. Nothing here imports an editor, so Cynosure gains no dependency.
 */

import { resolveColors } from "./chart-themes.js";
import { mix } from "./color.js";
import { createTheme } from "./create-theme.js";
import type { PaletteName, Theme, ThemeMode } from "./schema.js";

/** Every colour an editor needs, as hex: the syntax roles plus the editor's own surfaces. */
export interface EditorColors {
  background: string;
  foreground: string;
  /** Line numbers and the gutter's text. */
  lineNumber: string;
  gutter: string;
  /** The line the cursor is on. */
  activeLine: string;
  selection: string;
  cursor: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  type: string;
  variable: string;
  property: string;
  operator: string;
  tag: string;
  attribute: string;
  regexp: string;
  invalid: string;
}

/** The editor colours of one palette of a theme (by default Cynosure's own theme, light). */
export function editorColors(theme: Theme = createTheme(), palette: PaletteName = "light"): EditorColors {
  const p = resolveColors(theme, palette);
  return {
    background: p.surface,
    foreground: p.ink,
    lineNumber: p.muted,
    gutter: p.surface,
    activeLine: p.soft,
    selection: mix(p.accent, p.surface, 0.22),
    cursor: p.accentText,
    comment: p.syntaxComment,
    keyword: p.syntaxKeyword,
    string: p.syntaxString,
    number: p.syntaxNumber,
    function: p.syntaxFunction,
    type: p.syntaxType,
    variable: p.syntaxVariable,
    property: p.syntaxProperty,
    operator: p.syntaxOperator,
    tag: p.syntaxTag,
    attribute: p.syntaxAttribute,
    regexp: p.syntaxRegexp,
    invalid: p.dangerText,
  };
}

const bare = (hex: string) => hex.replace("#", "");
const isDark = (palette: PaletteName) => palette.startsWith("dark");

/** Monaco's theme shape (`monaco.editor.defineTheme(name, monacoTheme(...))`), written out so Monaco is not imported. */
export interface MonacoThemeData {
  base: "vs" | "vs-dark" | "hc-light" | "hc-black";
  inherit: boolean;
  rules: { token: string; foreground?: string; fontStyle?: string }[];
  colors: Record<string, string>;
}

/** A Monaco theme from a Cynosure palette. */
export function monacoTheme(theme: Theme = createTheme(), palette: PaletteName = "light"): MonacoThemeData {
  const c = editorColors(theme, palette);
  const contrast = palette.endsWith("contrast");
  const rule = (token: string, color: string, fontStyle?: string) => ({
    token,
    foreground: bare(color),
    ...(fontStyle ? { fontStyle } : {}),
  });
  return {
    base: isDark(palette) ? (contrast ? "hc-black" : "vs-dark") : contrast ? "hc-light" : "vs",
    inherit: true,
    rules: [
      rule("", c.foreground),
      rule("comment", c.comment, "italic"),
      rule("keyword", c.keyword),
      rule("string", c.string),
      rule("number", c.number),
      rule("regexp", c.regexp),
      rule("type", c.type),
      rule("type.identifier", c.type),
      rule("function", c.function),
      rule("identifier", c.variable),
      rule("variable", c.variable),
      rule("operator", c.operator),
      rule("delimiter", c.operator),
      rule("tag", c.tag),
      rule("attribute.name", c.attribute),
      rule("attribute.value", c.string),
      rule("key", c.property),
      rule("invalid", c.invalid),
    ],
    colors: {
      "editor.background": c.background,
      "editor.foreground": c.foreground,
      "editorLineNumber.foreground": c.lineNumber,
      "editorLineNumber.activeForeground": c.foreground,
      "editorGutter.background": c.gutter,
      "editor.lineHighlightBackground": c.activeLine,
      "editor.selectionBackground": c.selection,
      "editorCursor.foreground": c.cursor,
    },
  };
}

/** A TextMate theme (the format Shiki and VS Code read) from a Cynosure palette. */
export interface TextMateTheme {
  name: string;
  type: ThemeMode;
  colors: Record<string, string>;
  tokenColors: { scope: string[]; settings: { foreground?: string; fontStyle?: string } }[];
}

export function textMateTheme(theme: Theme = createTheme(), palette: PaletteName = "light"): TextMateTheme {
  const c = editorColors(theme, palette);
  const scope = (scopes: string[], foreground: string, fontStyle?: string) => ({
    scope: scopes,
    settings: { foreground, ...(fontStyle ? { fontStyle } : {}) },
  });
  return {
    name: `cynosure-${palette}`,
    type: isDark(palette) ? "dark" : "light",
    colors: {
      "editor.background": c.background,
      "editor.foreground": c.foreground,
      "editorLineNumber.foreground": c.lineNumber,
      "editor.lineHighlightBackground": c.activeLine,
      "editor.selectionBackground": c.selection,
      "editorCursor.foreground": c.cursor,
    },
    tokenColors: [
      scope(["comment", "punctuation.definition.comment"], c.comment, "italic"),
      scope(["keyword", "storage", "storage.type", "keyword.control"], c.keyword),
      scope(["string", "string.quoted", "string.template"], c.string),
      scope(["constant.numeric", "constant.language", "constant.character"], c.number),
      scope(["entity.name.function", "support.function", "meta.function-call"], c.function),
      scope(["entity.name.type", "support.type", "entity.name.class", "support.class"], c.type),
      scope(["variable", "variable.other"], c.variable),
      scope(["variable.other.property", "support.type.property-name", "meta.object-literal.key"], c.property),
      scope(["keyword.operator", "punctuation"], c.operator),
      scope(["entity.name.tag", "meta.tag"], c.tag),
      scope(["entity.other.attribute-name"], c.attribute),
      scope(["string.regexp"], c.regexp),
      scope(["invalid", "invalid.illegal"], c.invalid),
    ],
  };
}
