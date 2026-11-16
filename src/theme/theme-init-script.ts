export interface ThemeInitScriptOptions {
  /** localStorage key; must match `useColorMode({ key })`. Default: "cy-color-mode". */
  key?: string;
  /** Element to mark with `data-cy-mode`. Default: `<html>` (apps that own the page, like `target="document"`). */
  selector?: string;
}

/** JSON string literal that is also safe inside an HTML <script> element (no "<" at all). */
const literal = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");

/**
 * The text of a tiny script that applies the saved colour mode before the first paint, so a dark-mode visitor never
 * sees a light flash. Cynosure injects nothing: place it yourself, early in the page (inline in `<head>`, or written
 * to a file for pages whose content security policy forbids inline scripts). Reads localStorage only. With nothing
 * valid saved (or storage blocked) it marks `system`, so the page follows the OS from the first paint, unless the
 * element already carries a `data-cy-mode` of its own.
 */
export function themeInitScript({ key = "cy-color-mode", selector }: ThemeInitScriptOptions = {}): string {
  const target = selector ? `document.querySelector(${literal(selector)})` : "document.documentElement";
  return `(function(){try{var e=${target};if(!e)return;var m;try{m=localStorage.getItem(${literal(key)})}catch(_){}if(m!=="light"&&m!=="dark"&&m!=="system"){if(e.hasAttribute("data-cy-mode"))return;m="system"}e.setAttribute("data-cy-mode",m)}catch(_){}})();`;
}
