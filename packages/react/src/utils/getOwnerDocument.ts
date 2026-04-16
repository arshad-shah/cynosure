/**
 * Returns the `Document` that owns the given node — useful when the component
 * lives inside an iframe or a shadow root, where `document` from the top
 * window is the wrong target for querying or creating portal containers.
 * Falls back to the global `document` when the node is detached or when no
 * node is supplied.
 */
export function getOwnerDocument(node: Node | null | undefined): Document {
  if (node && 'ownerDocument' in node && node.ownerDocument) {
    return node.ownerDocument;
  }
  return typeof document !== 'undefined' ? document : (null as unknown as Document);
}
