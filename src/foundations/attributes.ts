/** Any `data-*` attribute, passed to the element as given (tests, analytics, state for a host page's own CSS). */
export interface DataAttributes {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * What a component passes to its root element besides its own props: an `id` (a link target, `aria-controls`,
 * `aria-labelledby` from elsewhere) and any `data-*` attribute. Its `ref` is that element too.
 */
export interface RootAttributes extends DataAttributes {
  /** Set on the root element: a link target, or the id another element points at. */
  id?: string | undefined;
}
