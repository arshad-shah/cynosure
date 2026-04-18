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
 * → light flash. Inject the result into `<head>` via `<script>` (server) or
 * `dangerouslySetInnerHTML`.
 *
 * The script intentionally avoids any modern syntax (no `let`, no arrow
 * functions) so it works in the dwindling set of legacy browsers your app
 * still supports without extra transpilation.
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

  const allowed = themes ? JSON.stringify([...themes]) : 'null';
  const storageGetter =
    storage === null
      ? 'function(){return null}'
      : `function(){try{return window.${storage}.getItem(${JSON.stringify(storageKey)})}catch(e){return null}}`;

  return `(function(){try{var d=document.documentElement;var a=${JSON.stringify(attribute)};var def=${JSON.stringify(defaultTheme)};var allowed=${allowed};var get=${storageGetter};var stored=get();var theme=stored||def;if(allowed&&allowed.indexOf(theme)===-1&&theme!=='system'){theme=def}var resolved=theme;if(theme==='system'){if(${enableSystem ? 'true' : 'false'}&&window.matchMedia){resolved=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}else{resolved='light'}}d.setAttribute(a,resolved);d.style.colorScheme=(resolved==='dark'?'dark':'light')}catch(e){}})();`;
}
