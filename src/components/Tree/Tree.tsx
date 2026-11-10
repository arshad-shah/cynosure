import {
  type CSSProperties,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  items: TreeItem[];
  /** Selected ids (controlled) and the default for uncontrolled use. */
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Expanded ids (controlled) and the default for uncontrolled use. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** `single` (default): one at a time. `multiple`: Space and clicks toggle. */
  selectionMode?: "single" | "multiple";
  /** Fetch the children of an item that `hasChildren` but has none yet. */
  loadChildren?: (item: TreeItem) => Promise<TreeItem[]>;
  /** Custom row content after the chevron (a value, a badge, a line number). `label` still drives type-ahead. */
  renderLabel?: (item: TreeItem) => ReactNode;
  /**
   * Render only the rows in view (for tens of thousands of rows). Give the tree a height (`style` or a class); rows
   * must share one height.
   */
  virtual?: boolean;
  size?: Extract<Size, "sm" | "md">;
  labels?: Partial<TreeLabels>;
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

  // Visible rows, depth first through expanded branches only: a collapsed subtree costs nothing.
  const rows = useMemo(() => {
    const out: Row[] = [];
    const openSet = new Set(open);
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
  }, [items, open, status, childrenOf, isBranch]);

  const focusable = rows.filter((r) => r.kind !== "loading" && !(r.kind === "item" && r.item.disabled));
  const tabStop =
    (focusKey && rows.some((r) => r.key === focusKey) ? focusKey : null) ??
    rows.find((r) => r.kind === "item" && picked.includes(r.item.id))?.key ??
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

  useLayoutEffect(() => {
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
    if (!open.includes(item.id)) setOpen([...open, item.id]);
    if (!childrenOf(item)) load(item);
  };
  const collapse = (item: TreeItem) => setOpen(open.filter((id) => id !== item.id));
  const toggle = (item: TreeItem) => (open.includes(item.id) ? collapse(item) : expand(item));
  const select = (item: TreeItem, additive: boolean) => {
    if (item.disabled) return;
    const next =
      selectionMode === "multiple" && additive
        ? picked.includes(item.id)
          ? picked.filter((id) => id !== item.id)
          : [...picked, item.id]
        : [item.id];
    setPicked(next);
  };
  const focusRow = (key: string | undefined) => {
    if (!key) return;
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
    const isOpen = open.includes(item.id);
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
        else if (branch) focusRow(rows[at + 1]?.kind === "item" ? rows[at + 1]?.key : undefined);
        break;
      case "ArrowLeft":
        if (branch && isOpen) collapse(item);
        else focusRow(row.parent ?? undefined);
        break;
      case "Enter":
      case " ":
        if (row.kind === "failed") load(item);
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
            open={open.includes(row.item.id)}
            selected={row.kind === "item" && picked.includes(row.item.id)}
            tabbable={row.key === tabStop}
            busy={status[row.item.id] === "loading"}
            text={text}
            onClick={onRowClick}
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
