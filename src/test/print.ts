/**
 * Applies the page's `@media print` rules to the screen, as the printout would get them, and returns a function that
 * takes them away again. Stories cannot switch the browser to print media, so this is how they test print styles.
 */
export function asIfPrinting(): () => void {
  const rules: string[] = [];
  const collect = (list: CSSRuleList) => {
    for (const rule of list)
      if (rule instanceof CSSMediaRule && rule.media.mediaText.includes("print"))
        for (const inner of rule.cssRules) rules.push(inner.cssText);
  };
  for (const sheet of document.styleSheets) {
    try {
      collect(sheet.cssRules);
    } catch {
      // A stylesheet from another origin cannot be read; Cynosure's own always can.
    }
  }
  const style = document.createElement("style");
  style.textContent = rules.join("\n");
  document.head.append(style);
  dispatchEvent(new Event("beforeprint"));
  return () => {
    dispatchEvent(new Event("afterprint"));
    style.remove();
  };
}
