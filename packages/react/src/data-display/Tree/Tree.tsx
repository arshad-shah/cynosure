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
export interface TreeRenderContext<T = TreeNode> {
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

export type TreeRenderItem<T = TreeNode> = (ctx: TreeRenderContext<T>) => ReactNode;

/**
 * Props for the {@link Tree}. `T` is the concrete node type — defaults to
 * {@link TreeNode}, but any shape works when paired with the accessor props
 * (`getId`, `getLabel`, `getChildren`, `getDisabled`, `getIcon`).
 */
export interface TreeProps<T = TreeNode>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect' | 'children'> {
  /** Root nodes. Each may carry its own `children` for nesting. */
  items: T[];
  /**
   * Override how the tree reads a node's stable id. Defaults to `(item) => item.id`.
   * Use this when your data uses a different field (e.g. `uuid`, `slug`).
   */
  getId?: (item: T) => string;
  /**
   * Override how the tree reads a node's default label. Defaults to `(item) => item.label`.
   * Only consulted when no `children` render prop is supplied.
   */
  getLabel?: (item: T) => ReactNode;
  /**
   * Override how the tree reads a node's nested children. Defaults to
   * `(item) => item.children`. Map your own field (e.g. `subItems`, `nodes`)
   * without rebuilding the data into the {@link TreeNode} shape.
   */
  getChildren?: (item: T) => T[] | undefined;
  /**
   * Override how the tree reads a node's disabled flag. Defaults to
   * `(item) => item.disabled`.
   */
  getDisabled?: (item: T) => boolean | undefined;
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

/** Default accessor bound to the {@link TreeNode} shape. */
const defaultGetId = <T,>(item: T): string => (item as TreeNode).id;
const defaultGetLabel = <T,>(item: T): ReactNode => (item as TreeNode).label;
const defaultGetChildren = <T,>(item: T): T[] | undefined =>
  (item as TreeNode).children as T[] | undefined;
const defaultGetDisabled = <T,>(item: T): boolean | undefined => (item as TreeNode).disabled;

/**
 * Build a flat list of [node, depth, parentId] in DFS order, respecting
 * expanded state — so keyboard navigation can walk visible items.
 */
function flatten<T>(
  items: T[],
  expanded: Set<string>,
  getId: (item: T) => string,
  getChildren: (item: T) => T[] | undefined,
  depth = 0,
  parent: string | null = null,
  out: Array<{ node: T; depth: number; parent: string | null }> = [],
): Array<{ node: T; depth: number; parent: string | null }> {
  for (const node of items) {
    out.push({ node, depth, parent });
    const children = getChildren(node);
    const id = getId(node);
    if (children && children.length > 0 && expanded.has(id)) {
      flatten(children, expanded, getId, getChildren, depth + 1, id, out);
    }
  }
  return out;
}

/**
 * Walk a tree and return the first node whose id matches. Uses the default
 * `TreeNode` shape — for custom shapes, pass through a helper that closes over
 * your own accessors.
 */
function findNode<T extends TreeNode>(items: T[], id: string): T | undefined {
  return findNodeWith(items, id, defaultGetId, defaultGetChildren);
}

function findNodeWith<T>(
  items: T[],
  id: string,
  getId: (item: T) => string,
  getChildren: (item: T) => T[] | undefined,
): T | undefined {
  for (const item of items) {
    if (getId(item) === id) return item;
    const children = getChildren(item);
    if (children) {
      const found = findNodeWith(children, id, getId, getChildren);
      if (found) return found;
    }
  }
  return undefined;
}

/** Collect every id under the given items in DFS order. */
function collectIds<T extends TreeNode>(items: T[]): string[] {
  return collectIdsWith(items, defaultGetId, defaultGetChildren);
}

function collectIdsWith<T>(
  items: T[],
  getId: (item: T) => string,
  getChildren: (item: T) => T[] | undefined,
): string[] {
  const result: string[] = [];
  for (const node of items) {
    result.push(getId(node));
    const children = getChildren(node);
    if (children) result.push(...collectIdsWith(children, getId, getChildren));
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
export function Tree<T = TreeNode>(props: TreeProps<T>): ReactElement {
  const {
    items,
    getId = defaultGetId as (item: T) => string,
    getLabel = defaultGetLabel as (item: T) => ReactNode,
    getChildren = defaultGetChildren as (item: T) => T[] | undefined,
    getDisabled = defaultGetDisabled as (item: T) => boolean | undefined,
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

  const flat = useMemo(
    () => flatten(items, expanded, getId, getChildren),
    [items, expanded, getId, getChildren],
  );

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
      const id = getId(node);
      const idx = flat.findIndex((f) => getId(f.node) === id);
      if (idx < 0) return;
      const hasChildren = (getChildren(node)?.length ?? 0) > 0;
      const isOpen = expanded.has(id);
      const nodeDisabled = !!getDisabled(node);
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = flat[idx + 1];
          if (next) focusRow(getId(next.node));
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = flat[idx - 1];
          if (prev) focusRow(getId(prev.node));
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          if (hasChildren && !isOpen) toggleExpanded(id, true);
          else if (hasChildren && isOpen) {
            const next = flat[idx + 1];
            if (next) focusRow(getId(next.node));
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          if (hasChildren && isOpen) toggleExpanded(id, false);
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
          if (first) focusRow(getId(first.node));
          break;
        }
        case 'End': {
          event.preventDefault();
          const last = flat[flat.length - 1];
          if (last) focusRow(getId(last.node));
          break;
        }
        case ' ':
        case 'Enter': {
          event.preventDefault();
          if (hasChildren) toggleExpanded(id);
          if (!nodeDisabled) toggleSelected(id, event.ctrlKey || event.metaKey);
          break;
        }
        case '*': {
          event.preventDefault();
          // expand all siblings at this depth
          const siblings = flat.filter((f) => f.depth === depth && f.parent === flat[idx]?.parent);
          const next = new Set(expanded);
          for (const s of siblings) {
            const kids = getChildren(s.node)?.length ?? 0;
            if (kids > 0) next.add(getId(s.node));
          }
          setExpandedList(Array.from(next));
          break;
        }
      }
    },
    [
      flat,
      expanded,
      focusRow,
      setExpandedList,
      toggleExpanded,
      toggleSelected,
      getId,
      getChildren,
      getDisabled,
    ],
  );

  const renderNode = (node: T, depth: number): ReactElement => {
    const id = getId(node);
    const children = getChildren(node);
    const hasChildren = !!(children && children.length > 0);
    const isExpanded = expanded.has(id);
    const isSelected = selected.has(id);
    const isFocused = focusedId === id;
    const nodeDisabled = !!getDisabled(node);

    const style: CSSProperties = { paddingInlineStart: `calc(${depth.toString()} * 1rem)` };

    const content: ReactNode = renderItem
      ? renderItem({
          item: node,
          depth,
          expanded: isExpanded,
          selected: isSelected,
          focused: isFocused,
          disabled: nodeDisabled,
        })
      : (getLabel(node) ?? id);

    const firstFlatId = flat[0] ? getId(flat[0].node) : undefined;

    return (
      <li
        key={id}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={selectionMode !== 'none' ? isSelected : undefined}
        aria-level={depth + 1}
        aria-disabled={nodeDisabled || undefined}
        data-expanded={isExpanded ? 'true' : 'false'}
        data-tree-id={id}
        className={treeItem}
        tabIndex={isFocused || (!focusedId && depth === 0 && firstFlatId === id) ? 0 : -1}
        onKeyDown={(e) => onKeyDown(e, node, depth)}
        onFocus={() => setFocusedId(id)}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: parent treeitem handles keyboard via onKeyDown */}
        <div
          data-slot="row"
          data-selected={isSelected ? 'true' : 'false'}
          data-focused={isFocused ? 'true' : undefined}
          data-disabled={nodeDisabled ? 'true' : undefined}
          className={treeRow}
          style={style}
          onClick={(e) => {
            if (nodeDisabled) return;
            if (hasChildren) toggleExpanded(id);
            toggleSelected(id, e.ctrlKey || e.metaKey);
            focusRow(id);
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
