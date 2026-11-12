import {
  type CSSProperties,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isTypeaheadKey, useTypeahead } from "../../foundations/listbox.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { chevronRight } from "../../icons/chevron-right.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { LoadingDots } from "../LoadingDots/LoadingDots.js";

export interface TreeTokens {
  indent: string;
  rowHeight: string;
  selectedBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    tree: TreeTokens;
  }
}

export interface TreeItem {
  id: string;
  label: string;
  icon?: IconData;
  disabled?: boolean;
  /** Known children. Leave it out and set `hasChildren` to load them with `loadChildren` on first expand. */
  children?: TreeItem[];
  hasChildren?: boolean;
}

export interface TreeLabels {
  loading: string;
  /** Row shown when `loadChildren` fails; Enter or a click on it tries again. */
  failed: string;
}

export interface TreeProps {
  /** Accessible name of the tree. */
  label: string;
  /** The top-level items; each can hold more under `children`. */
  items: TreeItem[];
  /** Selected ids (controlled) and the default for uncontrolled use. */
  selected?: string[];
  /** Ids selected at the start when uncontrolled. */
  defaultSelected?: string[];
  /** Called with the selected ids when the selection changes. */
  onSelectionChange?: (ids: string[]) => void;
  /** Expanded ids (controlled) and the default for uncontrolled use. */
  expanded?: string[];
  /** Ids expanded at the start when uncontrolled. */
  defaultExpanded?: string[];
  /** Called with the expanded ids when an item is expanded or collapsed. */
  onExpandedChange?: (ids: string[]) => void;
  /** `single` (default): one at a time. `multiple`: Space and clicks toggle. */
  selectionMode?: "single" | "multiple";
  /** Fetch the children of an item that `hasChildren` but has none yet. */
  loadChildren?: (item: TreeItem) => Promise<TreeItem[]>;
  /** Custom row content after the chevron (a value, a badge, a line number). `label` still drives type-ahead. */
  renderLabel?: (item: TreeItem) => ReactNode;
  /** Enter (or a double-click) on an item: its default action, such as opening it or copying its path. Space selects. */
  onAction?: ((item: TreeItem) => void) | undefined;
  /**
   * Render only the rows in view (for tens of thousands of rows). Give the tree a height (`style` or a class); rows
   * must share one height.
   */
  virtual?: boolean;
  /** Row height and indent. Default "md". */
  size?: Extract<Size, "sm" | "md">;
  /** Replace the built-in English text: the loading row and the failed-to-load row. */
  labels?: Partial<TreeLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-tree-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TreeLabels = { loading: "Loading…", failed: "Could not load. Press Enter to retry." };

/** One visible row: an item, or a loading or failure row for a parent whose children are being fetched. */
interface Row {
  key: string;
  item: TreeItem;
  level: number;
  pos: number;
  setSize: number;
  parent: string | null;
  kind: "item" | "loading" | "failed";
}

type Status = "loading" | "failed";

/** Hierarchical list (WAI-ARIA APG tree view): arrows, type-ahead, expand and collapse, selection, lazy children. */
export function Tree({
  label,
  items,
  selected,
  defaultSelected = [],
  onSelectionChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  selectionMode = "single",
  loadChildren,
  renderLabel,
  onAction,
  virtual = false,
  size = "md",
  labels,
  className,
  style,
}: TreeProps) {
  const loadingText = labels?.loading ?? DEFAULT_LABELS.loading;
  const failedText = labels?.failed ?? DEFAULT_LABELS.failed;
  const text = useMemo(() => ({ loading: loadingText, failed: failedText }), [loadingText, failedText]);
  const [picked, setPicked] = useControllableState(selected, defaultSelected, onSelectionChange);
  const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const [loaded, setLoaded] = useState<Record<string, TreeItem[]>>({});
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const moveFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const typeTo = useTypeahead();

  const childrenOf = useCallback((item: TreeItem) => item.children ?? loaded[item.id], [loaded]);
  const isBranch = useCallback((item: TreeItem) => Boolean(item.children?.length || item.hasChildren), []);

  // Sets once per render, so each row's lookups do not scan the lists.
  const openSet = useMemo(() => new Set(open), [open]);
  const pickedSet = useMemo(() => new Set(picked), [picked]);

  // Visible rows, depth first through expanded branches only: a collapsed subtree costs nothing.
  const rows = useMemo(() => {
    const out: Row[] = [];
    const walk = (list: TreeItem[], level: number, parent: string | null) => {
      list.forEach((item, i) => {
        out.push({ key: item.id, item, level, pos: i + 1, setSize: list.length, parent, kind: "item" });
        if (!openSet.has(item.id) || !isBranch(item)) return;
        const kids = childrenOf(item);
        if (kids) walk(kids, level + 1, item.id);
        else if (status[item.id])
          out.push({
            key: `${item.id}::${status[item.id]}`,
            item,
            level: level + 1,
            pos: 1,
            setSize: 1,
            parent: item.id,
            kind: status[item.id] as Status,
          });
      });
    };
    walk(items, 1, null);
    return out;
  }, [items, openSet, status, childrenOf, isBranch]);

  // Disabled and loading rows never take focus, so they are never the tab stop either: a tab stop that cannot be
  // focused would drop the tree out of the Tab order.
  const focusable = useMemo(
    () => rows.filter((r) => r.kind !== "loading" && !(r.kind === "item" && r.item.disabled)),
    [rows],
  );
  const focusableKeys = useMemo(() => new Set(focusable.map((r) => r.key)), [focusable]);
  const tabStop =
    (focusKey && focusableKeys.has(focusKey) ? focusKey : null) ??
    focusable.find((r) => r.kind === "item" && pickedSet.has(r.item.id))?.key ??
    focusable[0]?.key ??
    null;

  // Virtual mode: render the rows in view (plus a few either side). The focused row is always rendered, so keyboard
  // focus survives scrolling it out of view.
  const stopIndex = rows.findIndex((r) => r.key === tabStop);
  const win = useVirtualWindow(root, {
    count: rows.length,
    enabled: virtual,
    rowSelector: ".cy-tree-row",
    keep: stopIndex,
  });
  const rowH = win.rowSize;

  // A selection made from outside (search next/previous) moves the tab stop to it and scrolls it into view, without
  // taking focus from where the person is (the search field).
  const outside = selected?.[0];
  const seenOutside = useRef(outside);
  useClientLayoutEffect(() => {
    if (outside === seenOutside.current) return;
    seenOutside.current = outside;
    const index = rows.findIndex((r) => r.key === outside);
    if (outside === undefined || index < 0) return;
    setFocusKey(outside);
    if (virtual) win.reveal(index);
    else
      root.current
        ?.querySelector(`[data-key="${CSS.escape(outside)}"]`)
        ?.scrollIntoView?.({ block: "nearest" });
  });

  useClientLayoutEffect(() => {
    if (!moveFocus.current || !tabStop) return;
    moveFocus.current = false;
    // Bring the row into view first; it is rendered either way.
    if (stopIndex >= 0) win.reveal(stopIndex);
    root.current
      ?.querySelector<HTMLElement>(`[data-key="${CSS.escape(tabStop)}"]`)
      ?.focus({ preventScroll: virtual });
  });

  const load = (item: TreeItem) => {
    if (!loadChildren || item.children || loaded[item.id] || status[item.id] === "loading") return;
    setStatus((s) => ({ ...s, [item.id]: "loading" }));
    loadChildren(item).then(
      (kids) => {
        setLoaded((l) => ({ ...l, [item.id]: kids }));
        setStatus(({ [item.id]: _, ...rest }) => rest);
      },
      () => setStatus((s) => ({ ...s, [item.id]: "failed" })),
    );
  };
  const expand = (item: TreeItem) => {
    if (!openSet.has(item.id)) setOpen([...open, item.id]);
    if (!childrenOf(item)) load(item);
  };
  const collapse = (item: TreeItem) => setOpen(open.filter((id) => id !== item.id));
  const toggle = (item: TreeItem) => (openSet.has(item.id) ? collapse(item) : expand(item));
  const select = (item: TreeItem, additive: boolean) => {
    if (item.disabled) return;
    const next =
      selectionMode === "multiple" && additive
        ? pickedSet.has(item.id)
          ? picked.filter((id) => id !== item.id)
          : [...picked, item.id]
        : [item.id];
    setPicked(next);
  };
  const focusRow = (key: string | undefined) => {
    if (!key || !focusableKeys.has(key)) return;
    moveFocus.current = true;
    setFocusKey(key);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = rows.findIndex((r) => r.key === tabStop);
    const row = rows[at];
    if (!row) return;
    const rtl = isRtl(event.currentTarget);
    const key =
      rtl && event.key === "ArrowLeft"
        ? "ArrowRight"
        : rtl && event.key === "ArrowRight"
          ? "ArrowLeft"
          : event.key;
    const index = focusable.findIndex((r) => r.key === tabStop);
    const item = row.item;
    const branch = row.kind === "item" && isBranch(item);
    const isOpen = openSet.has(item.id);
    let handled = true;
    switch (key) {
      case "ArrowDown":
        focusRow(focusable[index + 1]?.key);
        break;
      case "ArrowUp":
        focusRow(focusable[index - 1]?.key);
        break;
      case "Home":
        focusRow(focusable[0]?.key);
        break;
      case "End":
        focusRow(focusable[focusable.length - 1]?.key);
        break;
      case "ArrowRight":
        if (branch && !isOpen) expand(item);
        // Into the first child that can take focus (a disabled first child is passed over).
        else if (branch) focusRow(focusable.find((r) => r.kind === "item" && r.parent === item.id)?.key);
        break;
      case "ArrowLeft":
        // To the parent; a disabled parent cannot take focus, so focus stays.
        if (branch && isOpen) collapse(item);
        else focusRow(row.parent ?? undefined);
        break;
      case "Enter":
      case " ":
        if (row.kind === "failed") load(item);
        else if (key === "Enter" && onAction && !item.disabled) onAction(item);
        else select(item, key === " " || event.ctrlKey || event.metaKey);
        break;
      case "*": {
        const siblings = rows.filter((r) => r.kind === "item" && r.parent === row.parent && isBranch(r.item));
        setOpen([...new Set([...open, ...siblings.map((r) => r.item.id)])]);
        for (const s of siblings) if (!childrenOf(s.item)) load(s.item);
        break;
      }
      default:
        handled = false;
        if (isTypeaheadKey(event)) {
          const labels = focusable.map((r) => (r.kind === "item" ? r.item.label : null));
          focusRow(focusable[typeTo(event.key, labels, index)]?.key);
          handled = true;
        }
    }
    if (handled) event.preventDefault();
  };

  // A click on a row selects it; on its chevron, toggles it; on a failure row, retries. The callback is stable (rows
  // are memoised) and reads the latest state through a ref.
  const clickRef = useRef<(row: Row, onChevron: boolean, additive: boolean) => void>(() => {});
  clickRef.current = (row, onChevron, additive) => {
    if (row.kind === "failed") return load(row.item);
    if (row.kind !== "item" || row.item.disabled) return;
    setFocusKey(row.key);
    if (onChevron) toggle(row.item);
    else select(row.item, additive);
  };
  const onRowClick = useCallback((row: Row, onChevron: boolean, additive: boolean) => {
    clickRef.current(row, onChevron, additive);
  }, []);

  return (
    <div
      ref={root}
      role="tree"
      aria-label={label}
      aria-multiselectable={selectionMode === "multiple" || undefined}
      className={className ? `cy-tree ${className}` : "cy-tree"}
      data-size={size}
      data-virtual={virtual || undefined}
      style={style}
      onKeyDown={onKeyDown}
      onScroll={virtual ? (e) => win.onScroll(e.currentTarget.scrollTop) : undefined}
    >
      {virtual && <div className="cy-tree-space" style={{ blockSize: win.total }} aria-hidden="true" />}
      {win.indices.map((i) => {
        const row = rows[i] as Row;
        return (
          <TreeRow
            key={row.key}
            row={row}
            offset={virtual ? i * rowH : undefined}
            renderLabel={renderLabel}
            branch={row.kind === "item" && isBranch(row.item)}
            open={openSet.has(row.item.id)}
            selected={row.kind === "item" && pickedSet.has(row.item.id)}
            tabbable={row.key === tabStop}
            busy={status[row.item.id] === "loading"}
            text={text}
            onClick={onRowClick}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

interface TreeRowProps {
  row: Row;
  /** Virtual mode: the row's position from the top of the list. */
  offset: number | undefined;
  renderLabel: ((item: TreeItem) => ReactNode) | undefined;
  branch: boolean;
  open: boolean;
  selected: boolean;
  tabbable: boolean;
  busy: boolean;
  text: TreeLabels;
  onClick: (row: Row, onChevron: boolean, additive: boolean) => void;
  onAction: ((item: TreeItem) => void) | undefined;
}

/** Memoised so that moving focus or selection re-renders two rows, not the whole tree. */
const TreeRow = memo(function TreeRow({
  row,
  offset,
  renderLabel,
  branch,
  open,
  selected,
  tabbable,
  busy,
  text,
  onClick,
  onAction,
}: TreeRowProps) {
  const { item, level, kind } = row;
  const note = kind === "loading" ? text.loading : kind === "failed" ? text.failed : null;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the tree handles keys for every row (roving focus)
    <div
      role="treeitem"
      data-key={row.key}
      data-kind={kind}
      className="cy-tree-row cy-reset"
      aria-level={level}
      aria-posinset={row.pos}
      aria-setsize={row.setSize}
      aria-expanded={branch ? open : undefined}
      aria-selected={kind === "item" ? selected : undefined}
      aria-disabled={kind === "loading" || item.disabled || undefined}
      aria-busy={busy || undefined}
      // Disabled and loading rows never take focus, not even from a click.
      tabIndex={kind === "loading" || item.disabled ? undefined : tabbable ? 0 : -1}
      style={{ "--_level": level - 1, insetBlockStart: offset } as CSSProperties}
      onClick={(e) => {
        const onChevron = (e.target as Element).closest(".cy-tree-chevron") !== null;
        onClick(row, onChevron, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        if (kind === "item" && !item.disabled && !(e.target as Element).closest(".cy-tree-chevron"))
          onAction?.(item);
      }}
    >
      <span className="cy-tree-chevron cy-reset" data-open={open || undefined} aria-hidden="true">
        {branch && <Icon icon={chevronRight} size="sm" />}
      </span>
      {note ? (
        <span className="cy-tree-note cy-reset">
          {kind === "loading" && <LoadingDots size="sm" />}
          {note}
        </span>
      ) : (
        <>
          {item.icon && <Icon icon={item.icon} className="cy-tree-icon" />}
          <span className="cy-tree-label cy-reset">{renderLabel ? renderLabel(item) : item.label}</span>
        </>
      )}
    </div>
  );
});
