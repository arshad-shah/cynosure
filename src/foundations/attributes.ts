import type { AriaAttributes, AriaRole } from "react";

/** Any `data-*` attribute, passed to the element as given (tests, analytics, state for a host page's own CSS). */
export interface DataAttributes {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * What a component passes to its root element besides its own props: an `id` (a link target, `aria-controls`,
 * `aria-labelledby` from elsewhere), any `data-*` attribute, `role` and any `aria-*` attribute (a live region on
 * status text, `aria-hidden` on decoration). Its `ref` is that element too. A role or ARIA state the component sets
 * itself (Notice's `role="alert"`, a labelled IconTile's `role="img"`) wins over the one passed.
 */
export interface RootAttributes extends DataAttributes, AriaAttributes {
  /** Set on the root element: a link target, or the id another element points at. */
  id?: string | undefined;
  /** The element's ARIA role, e.g. `status` with `aria-live` for text that is announced when it changes. */
  role?: AriaRole | undefined;
}
