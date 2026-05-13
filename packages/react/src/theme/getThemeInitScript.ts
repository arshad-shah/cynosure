export interface ThemeInitScriptOptions {
  /** Default theme when no persisted preference exists. Defaults to "system". */
  defaultTheme?: string;
  /** Allowed theme names; an unknown persisted value falls back to defaultTheme. */
  themes?: readonly string[];
  /** Storage backend. Defaults to "localStorage". Pass null to skip persistence. */
  storage?: 'localStorage' | 'sessionStorage' | null;
  /** Persistence key. Defaults to "cynosure-theme". */
  storageKey?: string;
  /** Attribute used for the theme selector. Defaults to "data-theme". */
  attribute?: `data-${string}`;
  /** Whether to honour `prefers-color-scheme` for the "system" value. Default true. */
  enableSystem?: boolean;
}

/**
 * Returns a single-line IIFE that resolves the active theme from storage and
 * sets the theme attribute on `<html>` before first paint, preventing the dark
 * → light flash. Inject the result into `<head>` via a server-rendered
 * `<script>` tag or React's inline-HTML setter.
 *
 * The script intentionally avoids any modern syntax (no `let`, no arrow
 * functions) so it works in the dwindling set of legacy browsers your app
 * still supports without extra transpilation.
 *
 * All caller-supplied option values are JSON-encoded and then have `</`
 * sequences escaped so a malicious string cannot break out of the surrounding
 * tag (CodeQL: js/unsafe-code-construction).
 */
export function getThemeInitScript(options: ThemeInitScriptOptions = {}): string {
  const {
    defaultTheme = 'system',
    themes,
    storage = 'localStorage',
    storageKey = 'cynosure-theme',
    attribute = 'data-theme',
    enableSystem = true,
  } = options;

  // Validate `storage` at runtime — TypeScript narrows callers but the type
  // surface is wider when this runs in plain JS consumers. Only the two
  // recognised values are interpolated unquoted into the IIFE; anything else
  // falls back to a no-op getter.
  const safeStorage: 'localStorage' | 'sessionStorage' | null =
    storage === 'localStorage' || storage === 'sessionStorage' ? storage : null;

  // JSON.stringify does NOT escape forward slashes, so an attacker-controlled
  // value containing the closing-script-tag sequence could break out of the
  // surrounding tag. Escaping the slash is the standard mitigation and
  // produces JSON that still parses identically. (CodeQL: js/unsafe-code-construction)
  const safeJson = (value: unknown): string =>
    JSON.stringify(value).replace(/<\/(?=[a-zA-Z!])/g, '<\\/');

  const allowedExpr = themes ? safeJson([...themes]) : 'null';
  const storageGetter =
    safeStorage === null
      ? 'function(){return null}'
      : `function(){try{return window.${safeStorage}.getItem(${safeJson(storageKey)})}catch(e){return null}}`;

  return `(function(){try{var d=document.documentElement;var a=${safeJson(attribute)};var def=${safeJson(defaultTheme)};var allowed=${allowedExpr};var get=${storageGetter};var stored=get();var theme=stored||def;if(allowed&&allowed.indexOf(theme)===-1&&theme!=='system'){theme=def}var resolved=theme;if(theme==='system'){if(${enableSystem ? 'true' : 'false'}&&window.matchMedia){resolved=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}else{resolved='light'}}d.setAttribute(a,resolved);d.style.colorScheme=(resolved==='dark'?'dark':'light')}catch(e){}})();`;
}
