import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import { treeGroup, treeItem, treeLabel, treeLeaf, treeRoot, treeRow } from './Tree.css.js';

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

/** Minimum shape of an item in a {@link Tree}. Extra keys are preserved and forwarded to the render prop. */
export interface TreeNode {
  /** Stable unique identifier — used as the React key and the selection/expansion key. */
  id: string;
  /** Default rendered label when no `children` render prop is supplied. */
  label?: ReactNode;
  /** Nested child nodes. Presence (length > 0) toggles the expander affordance. */
  children?: TreeNode[];
  /** Disables click/keyboard interaction for this node and skips it from selection. */
  disabled?: boolean;
  /** Optional leading glyph rendered next to the label (custom render only). */
  icon?: ReactNode;
  /** Arbitrary data payload, accessible via the render prop. */
  [key: string]: unknown;
}

/** Context passed to a {@link TreeRenderItem} for each node. */
export interface TreeRenderContext<T extends TreeNode = TreeNode> {
  /** The node being rendered. */
  item: T;
  /** 0-based depth in the tree (root nodes are `0`). */
  depth: number;
  /** Whether this node is currently expanded. */
  expanded: boolean;
  /** Whether this node is currently selected. */
  selected: boolean;
  /** Whether this node has roving-tabindex focus. */
  focused: boolean;
  /** Whether the node is non-interactive. */
  disabled: boolean;
}

export type TreeRenderItem<T extends TreeNode = TreeNode> = (
  ctx: TreeRenderContext<T>,
) => ReactNode;

/** Props for the {@link Tree}. `T` is the concrete node type extending {@link TreeNode}. */
export interface TreeProps<T extends TreeNode = TreeNode>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect' | 'children'> {
  /** Root nodes. Each may carry its own `children` for nesting. */
  items: T[];
  /** Controlled set of expanded node ids. Omit with `defaultExpandedIds` for uncontrolled. */
  expandedIds?: string[];
  /**
   * Initial expanded node ids when uncontrolled.
   * @default []
   */
  defaultExpandedIds?: string[];
  /** Fires whenever the expanded set changes (either mode). */
  onExpandedChange?: (ids: string[]) => void;
  /** Controlled set of selected node ids. */
  selectedIds?: string[];
  /**
   * Initial selected node ids when uncontrolled.
   * @default []
   */
  defaultSelectedIds?: string[];
  /** Fires whenever the selection changes. */
  onSelectionChange?: (ids: string[]) => void;
  /**
   * Selection behaviour: `none` disables selection; `single` keeps a single
   * selected id; `multiple` toggles ids on ctrl/meta-click and exposes
   * `aria-multiselectable`.
   * @default "none"
   */
  selectionMode?: TreeSelectionMode;
  /** Render each item. Receives the node + contextual flags. */
  children?: TreeRenderItem<T>;
  /** Accessible label for the `role="tree"` host. */
  'aria-label'?: string;
  /** id of a labelling element — alternative to `aria-label`. */
  'aria-labelledby'?: string;
}

/**
 * Build a flat list of [node, depth, parentId] in DFS order, respecting
 * expanded state — so keyboard navigation can walk visible items.
 */
function flatten<T extends TreeNode>(
  items: T[],
  expanded: Set<string>,
  depth = 0,
  parent: string | null = null,
  out: Array<{ node: T; depth: number; parent: string | null }> = [],
): Array<{ node: T; depth: number; parent: string | null }> {
  for (const node of items) {
    out.push({ node, depth, parent });
    const children = node.children as T[] | undefined;
    if (children && children.length > 0 && expanded.has(node.id)) {
      flatten(children, expanded, depth + 1, node.id, out);
    }
  }
  return out;
}

function findNode<T extends TreeNode>(items: T[], id: string): T | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    const children = item.children as T[] | undefined;
    if (children) {
      const found = findNode(children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function collectIds<T extends TreeNode>(items: T[]): string[] {
  const result: string[] = [];
  for (const node of items) {
    result.push(node.id);
    const children = node.children as T[] | undefined;
    if (children) result.push(...collectIds(children));
  }
  return result;
}

/**
 * Tree renders a nested ARIA-compliant `role="tree"` widget with roving
 * tabindex. Selection and expansion can be controlled or uncontrolled. The
 * full WAI-ARIA APG keyboard map is implemented: Up/Down walk visible rows,
 * Right expands (or moves into a child), Left collapses (or moves to the
 * parent), Home/End jump to the first/last visible row, Enter/Space toggles
 * expansion + selection, `*` expands all sibling branches at the current
 * depth. The component is virtualisation-free — every visible row is in the
 * DOM, so very large trees should be pre-pruned by the caller.
 */
export function Tree<T extends TreeNode = TreeNode>(props: TreeProps<T>): ReactElement {
  const {
    items,
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
    selectionMode = 'none',
    children: renderItem,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  } = props;

  const [expandedList, setExpandedList] = useControllableState<string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds ?? [],
    onChange: onExpandedChange,
  });
  const [selectedList, setSelectedList] = useControllableState<string[]>({
    value: selectedIds,
    defaultValue: defaultSelectedIds ?? [],
    onChange: onSelectionChange,
  });

  const expanded = useMemo(() => new Set(expandedList ?? []), [expandedList]);
  const selected = useMemo(() => new Set(selectedList ?? []), [selectedList]);

  const flat = useMemo(() => flatten(items, expanded), [items, expanded]);

  const [focusedId, setFocusedId] = useState<string | null>(null);

  const toggleExpanded = useCallback(
    (id: string, force?: boolean) => {
      const isOpen = expanded.has(id);
      const shouldOpen = force ?? !isOpen;
      if (shouldOpen === isOpen) return;
      const next = new Set(expanded);
      if (shouldOpen) next.add(id);
      else next.delete(id);
      setExpandedList(Array.from(next));
    },
    [expanded, setExpandedList],
  );

  const toggleSelected = useCallback(
    (id: string, multi: boolean) => {
      if (selectionMode === 'none') return;
      if (selectionMode === 'single') {
        setSelectedList([id]);
        return;
      }
      // multiple
      const next = new Set(selected);
      if (multi) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      setSelectedList(Array.from(next));
    },
    [selected, selectionMode, setSelectedList],
  );

  const rootRef = useRef<HTMLUListElement | null>(null);
  const focusRow = useCallback((id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() => {
      const el = rootRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`);
      el?.focus();
    });
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, node: T, depth: number) => {
      const idx = flat.findIndex((f) => f.node.id === node.id);
      if (idx < 0) return;
      const hasChildren = (node.children as T[] | undefined)?.length ?? 0;
      const isOpen = expanded.has(node.id);
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = flat[idx + 1];
          if (next) focusRow(next.node.id);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = flat[idx - 1];
          if (prev) focusRow(prev.node.id);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (hasChildren && !isOpen) toggleExpanded(node.id, true);
          else if (hasChildren && isOpen) {
            const next = flat[idx + 1];
            if (next) focusRow(next.node.id);
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (hasChildren && isOpen) toggleExpanded(node.id, false);
          else {
            // move to parent
            const parentId = flat[idx]?.parent;
            if (parentId) focusRow(parentId);
          }
          break;
        }
        case 'Home': {
          event.preventDefault();
          const first = flat[0];
          if (first) focusRow(first.node.id);
          break;
        }
        case 'End': {
          event.preventDefault();
          const last = flat[flat.length - 1];
          if (last) focusRow(last.node.id);
          break;
        }
        case ' ':
        case 'Enter': {
          event.preventDefault();
          if (hasChildren) toggleExpanded(node.id);
          if (!node.disabled) toggleSelected(node.id, event.ctrlKey || event.metaKey);
          break;
        }
        case '*': {
          event.preventDefault();
          // expand all siblings at this depth
          const siblings = flat.filter((f) => f.depth === depth && f.parent === flat[idx]?.parent);
          const next = new Set(expanded);
          for (const s of siblings) {
            const kids = (s.node.children as T[] | undefined)?.length ?? 0;
            if (kids > 0) next.add(s.node.id);
          }
          setExpandedList(Array.from(next));
          break;
        }
      }
    },
    [flat, expanded, focusRow, setExpandedList, toggleExpanded, toggleSelected],
  );

  const renderNode = (node: T, depth: number): ReactElement => {
    const children = node.children as T[] | undefined;
    const hasChildren = !!(children && children.length > 0);
    const isExpanded = expanded.has(node.id);
    const isSelected = selected.has(node.id);
    const isFocused = focusedId === node.id;

    const style: CSSProperties = { paddingInlineStart: `calc(${depth.toString()} * 1rem)` };

    const content: ReactNode = renderItem
      ? renderItem({
          item: node,
          depth,
          expanded: isExpanded,
          selected: isSelected,
          focused: isFocused,
          disabled: !!node.disabled,
        })
      : (node.label ?? node.id);

    return (
      <li
        key={node.id}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={selectionMode !== 'none' ? isSelected : undefined}
        aria-level={depth + 1}
        aria-disabled={node.disabled || undefined}
        data-expanded={isExpanded ? 'true' : 'false'}
        data-tree-id={node.id}
        className={treeItem}
        tabIndex={isFocused || (!focusedId && depth === 0 && flat[0]?.node.id === node.id) ? 0 : -1}
        onKeyDown={(e) => onKeyDown(e, node, depth)}
        onFocus={() => setFocusedId(node.id)}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: parent treeitem handles keyboard via onKeyDown */}
        <div
          data-slot="row"
          data-selected={isSelected ? 'true' : 'false'}
          data-focused={isFocused ? 'true' : undefined}
          data-disabled={node.disabled ? 'true' : undefined}
          className={treeRow}
          style={style}
          onClick={(e) => {
            if (node.disabled) return;
            if (hasChildren) toggleExpanded(node.id);
            toggleSelected(node.id, e.ctrlKey || e.metaKey);
            focusRow(node.id);
          }}
        >
          {hasChildren ? (
            <span aria-hidden="true">
              {!isExpanded ? <ChevronRight size={'14'} /> : <ChevronDown size={'14'} />}
            </span>
          ) : (
            <span className={treeLeaf} aria-hidden="true" />
          )}
          <span className={treeLabel}>{content}</span>
        </div>
        {hasChildren && isExpanded ? (
          // biome-ignore lint/a11y/useSemanticElements: role="group" is the ARIA-APG pattern for nested tree items
          <ul role="group" className={treeGroup}>
            {(children as T[]).map((c) => renderNode(c, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <ul
      ref={rootRef}
      role="tree"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
      className={cn(treeRoot, className)}
      {...rest}
    >
      {items.map((node) => renderNode(node, 0))}
    </ul>
  );
}

/**
 * TreeItem + TreeItemLabel are passthroughs — the render function in
 * `<Tree>` is the source of truth; these exist so consumers can restructure
 * their custom node content clearly.
 */
/** Props for the passthrough {@link TreeItem} wrapper used inside the render prop. */
export interface TreeItemProps extends HTMLAttributes<HTMLDivElement> {}
/** Thin passthrough `<div>` for structuring custom node content rendered via {@link TreeProps.children}. */
export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(function TreeItem(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest} />;
});

/** Props for {@link TreeItemLabel} — the styled label slot for custom node content. */
export interface TreeItemLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Depth hint for indentation-aware custom styling (positional only; passed through). */
  depth?: number;
  /** Leading glyph rendered before the label. */
  icon?: ReactNode;
}
/** Styled label slot for use inside a {@link TreeProps.children} render function. */
export const TreeItemLabel = forwardRef<HTMLSpanElement, TreeItemLabelProps>(function TreeItemLabel(
  { className, icon, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(treeLabel, className)} {...rest}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
});

/** Collect every id under the given tree — useful for expand-all helpers. */
export { collectIds as treeCollectIds, findNode as treeFindNode };
