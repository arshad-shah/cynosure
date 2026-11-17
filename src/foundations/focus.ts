/**
 * The focused element, looking inside open shadow roots: `document.activeElement` stops at the shadow host, so a
 * component rendered in a shadow root would otherwise never see its own focused control. Null on the server.
 */
export function deepActiveElement(doc: Document | null = typeof document === "undefined" ? null : document) {
  let active = doc?.activeElement ?? null;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active as HTMLElement | null;
}

/**
 * Whether Tab can land on `el`: a focusable element with no negative `tabIndex` (a roving item that is not the
 * current one), not inert, rendered, and not an unchecked radio of a group with a checked one (Tab enters a radio
 * group on its checked radio).
 */
export function isTabStop(el: HTMLElement) {
  if (el.tabIndex < 0 || el.closest("[inert]") || !el.getClientRects().length) return false;
  if (!(el instanceof HTMLInputElement) || el.type !== "radio" || el.checked || !el.name) return true;
  const scope = (el.form ?? el.getRootNode()) as ParentNode;
  return ![...scope.querySelectorAll<HTMLInputElement>('input[type="radio"]')].some(
    (r) => r.name === el.name && r.checked && r.form === el.form,
  );
}

/**
 * Where focus can actually go back to. A Dialog or CommandPalette opened from a Menu item remembers that item, but
 * the menu has closed (hidden, still in the DOM): fall back to the button that controls the hidden popover.
 */
export function reachable(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  // A closed popover can still be fading out (displayed), so ask the popover, not only the layout.
  const popover = el.closest<HTMLElement>("[popover][id]");
  const closed = popover ? !popover.matches(":popover-open") : el.checkVisibility?.() === false;
  if (!closed) return el;
  const root = el.getRootNode() as Document | ShadowRoot;
  return (popover && root.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(popover.id)}"]`)) ?? el;
}
