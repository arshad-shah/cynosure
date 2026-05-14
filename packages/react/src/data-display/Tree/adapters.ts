import type { ReactNode } from 'react';
import type { TreeNode } from './Tree.js';

/**
 * Options for {@link mapToTreeNodes}. Each accessor reads a single field off
 * the consumer's source shape; only `getId` is required.
 */
export interface MapToTreeNodesOptions<T> {
  /** Stable unique id for the node. */
  getId: (item: T) => string;
  /** Default rendered label. */
  getLabel?: (item: T) => ReactNode;
  /** Nested children. */
  getChildren?: (item: T) => readonly T[] | undefined;
  /** Disabled flag — node is non-interactive. */
  getDisabled?: (item: T) => boolean | undefined;
  /** Leading icon (consumed by custom render functions). */
  getIcon?: (item: T) => ReactNode | undefined;
}

/**
 * Convert an arbitrary nested array into the {@link TreeNode} shape that
 * `<Tree>` consumes. Useful as a one-shot transform when you'd rather not
 * thread accessor props through the component, or when sharing the same
 * normalised data with other code.
 *
 * @example
 * const apiNodes = [{ uuid: 'a', name: 'A', subItems: [{ uuid: 'b', name: 'B' }] }];
 * const items = mapToTreeNodes(apiNodes, {
 *   getId: (n) => n.uuid,
 *   getLabel: (n) => n.name,
 *   getChildren: (n) => n.subItems,
 * });
 */
export function mapToTreeNodes<T>(
  items: readonly T[],
  options: MapToTreeNodesOptions<T>,
): TreeNode[] {
  const { getId, getLabel, getChildren, getDisabled, getIcon } = options;
  const result: TreeNode[] = [];
  for (const item of items) {
    const children = getChildren?.(item);
    const node: TreeNode = {
      id: getId(item),
      ...(getLabel ? { label: getLabel(item) } : {}),
      ...(children && children.length > 0 ? { children: mapToTreeNodes(children, options) } : {}),
      ...(getDisabled?.(item) ? { disabled: true } : {}),
      ...(getIcon ? { icon: getIcon(item) } : {}),
    };
    result.push(node);
  }
  return result;
}
