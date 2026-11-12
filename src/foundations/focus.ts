/**
 * The focused element, looking inside open shadow roots: `document.activeElement` stops at the shadow host, so a
 * component rendered in a shadow root would otherwise never see its own focused control. Null on the server.
 */
export function deepActiveElement(doc: Document | null = typeof document === "undefined" ? null : document) {
  let active = doc?.activeElement ?? null;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active as HTMLElement | null;
}
