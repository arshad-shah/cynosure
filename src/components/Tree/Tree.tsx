import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isTypeaheadKey, useTypeahead } from "../../foundations/listbox.js";
import { OptionIcon, type OptionIconColor } from "../../foundations/option-icon.js";
import { useVirtualWindow } from "../../foundations/virtual-window.js";
import { chevronRight } from "../../icons/chevron-right.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { ContextMenu, type ContextMenuKeyTargetProps } from "../ContextMenu/ContextMenu.js";
import { HighlightedText } from "../HighlightedText/HighlightedText.js";
import { IconButton } from "../IconButton/IconButton.js";
import { LoadingDots } from "../LoadingDots/LoadingDots.js";
import type { MenuEntry } from "../Menu/Menu.js";
import { RowActions } from "../RowActions/RowActions.js";

export interface TreeTokens {
  trailingInk: string;
  groupInk: string;
  indent: string;
  rowHeight: string;
  selectedBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    tree: TreeTokens;
  }
}

/** A button at the end of a row (View data, Open in a new tab), shown while the row is hovered, focused or selected. */
export interface TreeItemAction {
  /** Handed to `onCommand` with the item when the button is pressed. */
  value: string;
  /** The button's accessible name and tooltip. */
  label: string;
  /** The button's icon. */
  icon: IconData;
  /** Shown but cannot be pressed. */
  disabled?: boolean;
}

export interface TreeItem<T = unknown> extends OptionIconColor {
  /** Identifies the item: selection, expansion, `loadingIds`, `errorIds` and `reload` use it. Unique in the tree. */
  id: string;
  /** The row's text; type-ahead and a string `filter` match it. */
  label: string;
  /** Icon before the label, muted by default. Colour it with `iconTone` or `iconColor`. */
  icon?: IconData;
  /** Shown but cannot be focused, selected or acted on. */
  disabled?: boolean;
  /** Known children. Leave it out and set `hasChildren` to load them with `loadChildren` on first expand. */
  children?: TreeItem<T>[];
  /** It has children not known yet: loaded by `loadChildren`, or put in `children` by you (`loadingIds`). */
  hasChildren?: boolean;
  /**
   * `group`: a heading for the rows under it (Tables, Views, Functions). It is never selected: Enter, Space and a click
   * open and close it, and its end shows how many children it has (shown ones, while filtering) unless `trailing` is
   * given.
   */
  kind?: "item" | "group";
  /** At the end of the row: a count, a badge, a short value. Part of the row's name. */
  trailing?: ReactNode;
  /** Your own payload (a table's schema, a node's type), handed back with the item in every callback. */
  data?: T;
  /**
   * Buttons at the end of the row, shown while it is hovered, focused or selected. On the focused row they are in the
   * Tab order: Tab reaches them, Shift+Tab or Escape goes back to the row. Pressed, they call `onCommand`.
   */
  actions?: TreeItemAction[];
  /**
   * Commands in a ContextMenu, opened by right-click, a long press, Shift+F10 or the context menu key on the row: items,
   * or sections of items, as in `Menu`. Chosen, they call `onCommand`.
   */
  contextMenu?: MenuEntry[];
}

/** Imperative control of a Tree, through its `handle` prop. */
export interface TreeHandle {
  /**
   * Forget the loaded children of an item and run `loadChildren` again: now when it is open (a loading row shows),
   * else the next time it opens.
   */
  reload: (id: string) => void;
}

export interface TreeLabels {
  loading: string;
  /** Row shown when `loadChildren` fails; Enter or a click on it tries again. */
  failed: string;
  /** The name of a row's context menu, from its label. Default "users actions". */
  menu: (label: string) => string;
}

/**
 * Which items match: a string (case-insensitive, anywhere in the label), or a function returning true, false, or the
 * indices of the matched characters in the label (a fuzzy matcher's positions) to mark exactly those.
 */
export type TreeFilter<T = unknown> = string | ((item: TreeItem<T>) => boolean | readonly number[] | null);

export interface TreeProps<T = unknown> {
  /** Accessible name of the tree. */
  label: string;
  /** The top-level items; each can hold more under `children`. */
  items: TreeItem<T>[];
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
  loadChildren?: (item: TreeItem<T>) => Promise<TreeItem<T>[]>;
  /**
   * Items whose children are loading somewhere else (a store): a loading row shows under them while open and they have
   * no `children` yet; with children, the item is only marked busy.
   */
  loadingIds?: readonly string[];
  /** Items whose children failed to load somewhere else: an error row shows under them in place of any children. */
  errorIds?: readonly string[];
  /** Called when a failed item is retried (Enter or a click on its error row, or `renderError`'s `retry`). */
  onRetry?: (item: TreeItem<T>) => void;
  /** Content of the error row of an item whose children failed. `retry` runs `loadChildren` again and `onRetry`. */
  renderError?: (item: TreeItem<T>, retry: () => void) => ReactNode;
  /** Content of a row shown under an open item that has no children ("No columns"). Without it, nothing shows. */
  renderEmpty?: (item: TreeItem<T>) => ReactNode;
  /**
   * Show only matching items, with their ancestors (opened) and their own children, and mark the matched text. A string
   * matches the label anywhere, ignoring case. Only known children are searched. Pass a stable function (useCallback):
   * branches closed while filtering open again when it changes.
   */
  filter?: TreeFilter<T> | undefined;
  /**
   * Custom row content after the chevron and icon (a value, a badge, a line number). `label` is the label as the tree
   * would draw it (with matches marked while filtering). The item's `label` still drives type-ahead.
   */
  renderLabel?: (item: TreeItem<T>, label: ReactNode) => ReactNode;
  /** Enter (or a double-click) on an item: its default action, such as opening it or copying its path. Space selects. */
  onAction?: ((item: TreeItem<T>) => void) | undefined;
  /** Called with the `value` of a pressed row action or a chosen context menu command, and the row's item. */
  onCommand?: ((value: string, item: TreeItem<T>) => void) | undefined;
  /** Imperative control: `reload(id)`. */
  handle?: Ref<TreeHandle>;
  /**
   * Render only the rows in view (for tens of thousands of rows). Give the tree a height (`style` or a class); rows
   * must share one height.
   */
  virtual?: boolean;
  /** Row height and indent. Default "md". */
  size?: Extract<Size, "sm" | "md">;
  /** Replace the built-in English text: the loading row, the failed-to-load row and the context menu's name. */
  labels?: Partial<TreeLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-tree-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TreeLabels = {
  loading: "Loading…",
  failed: "Could not load. Press Enter to retry.",
  menu: (label) => `${label} actions`,
};

/** One visible row: an item, or a loading, failure or empty row under a parent. */
interface Row {
  key: string;
  item: TreeItem<never>;
  level: number;
  pos: number;
  setSize: number;
  parent: string | null;
  kind: "item" | "loading" | "failed" | "empty";
}

type Status = "loading" | "failed";
/** How an item matched the filter: by the query string, or at these character positions. */
type Match = true | readonly number[];

/** A press on a control inside a row (an action, a retry button) is that control's, not the row's. */
const onControl = (event: { target: EventTarget; currentTarget: Element }) => {
  const control = (event.target as Element).closest("button, a, input, [role='button']");
  return control !== null && control !== event.currentTarget && event.currentTarget.contains(control);
};

/** Hierarchical list (WAI-ARIA APG tree view): arrows, type-ahead, expand and collapse, selection, lazy children. */
export function Tree<T = unknown>(props: TreeProps<T>) {
  // Rows are typed loosely inside; every item handed back is one of the caller's own.
  const {
    label,
    items: given,
    selected,
    defaultSelected = [],
    onSelectionChange,
    expanded,
    defaultExpanded = [],
    onExpandedChange,
    selectionMode = "single",
    loadChildren,
    loadingIds,
    errorIds,
    onRetry,
    renderError,
    renderEmpty,
    filter,
    renderLabel,
    onAction,
    onCommand,
    handle,
    virtual = false,
    size = "md",
    labels,
    className,
    style,
  } = props as unknown as TreeProps<never>;
  const items = given as TreeItem<never>[];
  const loadingText = labels?.loading ?? DEFAULT_LABELS.loading;
  const failedText = labels?.failed ?? DEFAULT_LABELS.failed;
  const menuName = labels?.menu ?? DEFAULT_LABELS.menu;
  const text = useMemo(() => ({ loading: loadingText, failed: failedText }), [loadingText, failedText]);
  const [picked, setPicked] = useControllableState(selected, defaultSelected, onSelectionChange);
  const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const [loaded, setLoaded] = useState<Record<string, TreeItem<never>[]>>({});
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const moveFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const typeTo = useTypeahead();

  const childrenOf = useCallback((item: TreeItem<never>) => item.children ?? loaded[item.id], [loaded]);
  const isBranch = useCallback(
    (item: TreeItem<never>) => Boolean(item.children?.length || item.hasChildren),
    [],
  );

  // Sets once per render, so each row's lookups do not scan the lists.
  const openSet = useMemo(() => new Set(open), [open]);
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const loadingSet = useMemo(() => new Set(loadingIds), [loadingIds]);
  const errorSet = useMemo(() => new Set(errorIds), [errorIds]);
  const statusOf = useCallback(
    (id: string): Status | undefined =>
      errorSet.has(id) ? "failed" : loadingSet.has(id) ? "loading" : status[id],
    [errorSet, loadingSet, status],
  );

  // Filtering: which items match, which stay shown (matches, their ancestors and everything under a match) and which
  // ancestors are opened to show them. Only known children are searched.
  const query = typeof filter === "string" ? filter.trim() : "";
  const search = useMemo(() => {
    if (filter === undefined || (typeof filter === "string" && !query)) return null;
    const needle = query.toLowerCase();
    const matchOf = (item: TreeItem<never>): Match | null => {
      if (typeof filter === "string") return item.label.toLowerCase().includes(needle) ? true : null;
      const found = filter(item);
      return found === true ? true : Array.isArray(found) ? (found as readonly number[]) : null;
    };
    const matches = new Map<string, Match>();
    const shown = new Set<string>();
    const opened = new Set<string>();
    const visit = (list: TreeItem<never>[], underMatch: boolean): boolean => {
      let any = false;
      for (const item of list) {
        const match = matchOf(item);
        if (match) matches.set(item.id, match);
        const kids = childrenOf(item);
        const below = kids ? visit(kids, underMatch || match !== null) : false;
        if (below) opened.add(item.id);
        if (match || below || underMatch) shown.add(item.id);
        any ||= match !== null || below;
      }
      return any;
    };
    visit(items, false);
    return { matches, shown, opened };
  }, [filter, query, items, childrenOf]);
  // Branches closed by hand while filtering, so a matched ancestor can still be closed. Forgotten when the filter changes.
  const [shut, setShut] = useState<{ filter: unknown; ids: Set<string> }>({ filter, ids: new Set() });
  const shutIds = shut.filter === filter ? shut.ids : null;
  const isOpen = useCallback(
    (id: string) => (openSet.has(id) || Boolean(search?.opened.has(id))) && !shutIds?.has(id),
    [openSet, search, shutIds],
  );

  // Visible rows, depth first through expanded branches only: a collapsed subtree costs nothing.
  const rows = useMemo(() => {
    const out: Row[] = [];
    const note = (item: TreeItem<never>, level: number, kind: Row["kind"]) =>
      out.push({ key: `${item.id}::${kind}`, item, level, pos: 1, setSize: 1, parent: item.id, kind });
    const walk = (all: TreeItem<never>[], level: number, parent: string | null) => {
      const list = search ? all.filter((item) => search.shown.has(item.id)) : all;
      list.forEach((item, i) => {
        out.push({ key: item.id, item, level, pos: i + 1, setSize: list.length, parent, kind: "item" });
        if (!isOpen(item.id) || !isBranch(item)) return;
        const kids = childrenOf(item);
        const state = statusOf(item.id);
        if (state === "failed") note(item, level + 1, "failed");
        else if (kids?.length) walk(kids, level + 1, item.id);
        else if (state === "loading") note(item, level + 1, "loading");
        else if (kids && renderEmpty) note(item, level + 1, "empty");
      });
    };
    walk(items, 1, null);
    return out;
  }, [items, search, isOpen, statusOf, childrenOf, isBranch, renderEmpty]);

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

  const rowElement = (key: string) =>
    root.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`) ?? null;
  useClientLayoutEffect(() => {
    if (!moveFocus.current || !tabStop) return;
    moveFocus.current = false;
    // Bring the row into view first; it is rendered either way.
    if (stopIndex >= 0) win.reveal(stopIndex);
    rowElement(tabStop)?.focus({ preventScroll: virtual });
  });

  // Fetch an item's children, with a loading row meanwhile and a failure row if it fails.
  const fetchChildren = (item: TreeItem<never>, from: NonNullable<typeof loadChildren>) => {
    setStatus((s) => ({ ...s, [item.id]: "loading" }));
    from(item).then(
      (kids) => {
        setLoaded((l) => ({ ...l, [item.id]: kids }));
        setStatus(({ [item.id]: _, ...rest }) => rest);
      },
      () => setStatus((s) => ({ ...s, [item.id]: "failed" })),
    );
  };
  const load = (item: TreeItem<never>) => {
    if (!loadChildren || item.children || loaded[item.id] || status[item.id] === "loading") return;
    fetchChildren(item, loadChildren);
  };
  const retry = (item: TreeItem<never>) => {
    onRetry?.(item);
    load(item);
  };
  // `reload` reads the latest state through a ref, so the handle never changes.
  const latest = useRef({ items, loaded, isOpen, loadChildren, fetchChildren });
  latest.current = { items, loaded, isOpen, loadChildren, fetchChildren };
  useImperativeHandle(
    handle,
    () => ({
      reload: (id) => {
        const { items, loaded, isOpen, loadChildren, fetchChildren } = latest.current;
        const find = (list: TreeItem<never>[] | undefined): TreeItem<never> | undefined => {
          for (const item of list ?? []) {
            const found = item.id === id ? item : find(item.children ?? loaded[item.id]);
            if (found) return found;
          }
          return undefined;
        };
        const item = find(items);
        if (!item || item.children || !loadChildren) return;
        setLoaded(({ [id]: _, ...rest }) => rest);
        // Open: load now. Closed: the children load the next time it opens.
        if (isOpen(id)) fetchChildren(item, loadChildren);
        else setStatus(({ [id]: _, ...rest }) => rest);
      },
    }),
    [],
  );

  const expand = (item: TreeItem<never>) => {
    if (!openSet.has(item.id)) setOpen([...open, item.id]);
    if (shutIds?.has(item.id)) setShut({ filter, ids: new Set([...shutIds].filter((id) => id !== item.id)) });
    if (!childrenOf(item)) load(item);
  };
  const collapse = (item: TreeItem<never>) => {
    if (openSet.has(item.id)) setOpen(open.filter((id) => id !== item.id));
    if (search?.opened.has(item.id)) setShut({ filter, ids: new Set([...(shutIds ?? []), item.id]) });
  };
  const toggle = (item: TreeItem<never>) => (isOpen(item.id) ? collapse(item) : expand(item));
  const select = (item: TreeItem<never>, additive: boolean) => {
    if (item.disabled || item.kind === "group") return;
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
    // Keys pressed in a row's action buttons are theirs, except the arrows, Home and End (which move between rows) and
    // Escape (which goes back to the row).
    if ((event.target as Element).getAttribute("role") !== "treeitem") {
      if (event.key === "Escape") {
        event.preventDefault();
        rowElement(row.key)?.focus();
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    }
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
    const opened = isOpen(item.id);
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
        if (branch && !opened) expand(item);
        // Into the first child that can take focus (a disabled first child is passed over).
        else if (branch) focusRow(focusable.find((r) => r.kind === "item" && r.parent === item.id)?.key);
        break;
      case "ArrowLeft":
        // To the parent; a disabled parent cannot take focus, so focus stays.
        if (branch && opened) collapse(item);
        else focusRow(row.parent ?? undefined);
        break;
      case "Enter":
      case " ":
        if (row.kind === "failed") retry(item);
        else if (row.kind !== "item") break;
        else if (item.kind === "group") toggle(item);
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

  // Focus arriving inside a row (its action buttons, a click) makes that row the tab stop, so the keys carry on from it.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const key = (event.target as Element).closest<HTMLElement>("[role='treeitem']")?.dataset.key;
    if (key && key !== focusKey && focusableKeys.has(key)) setFocusKey(key);
  };

  // A click on a row selects it (a group opens or closes); on its chevron, toggles it; on a failure row, retries. The
  // callbacks are stable (rows are memoised) and read the latest state through a ref.
  const handlers = useRef({
    click: (_row: Row, _onChevron: boolean, _additive: boolean) => {},
    retry: (_item: TreeItem<never>) => {},
    command: (_value: string, _item: TreeItem<never>) => {},
  });
  handlers.current = {
    click: (row, onChevron, additive) => {
      if (row.kind === "failed") return retry(row.item);
      if (row.kind !== "item" || row.item.disabled) return;
      setFocusKey(row.key);
      if (onChevron || row.item.kind === "group") toggle(row.item);
      else select(row.item, additive);
    },
    retry,
    command: (value, item) => onCommand?.(value, item),
  };
  const calls = useMemo(
    () => ({
      click: (row: Row, onChevron: boolean, additive: boolean) =>
        handlers.current.click(row, onChevron, additive),
      retry: (item: TreeItem<never>) => handlers.current.retry(item),
      command: (value: string, item: TreeItem<never>) => handlers.current.command(value, item),
    }),
    [],
  );

  const tree = (menuFor: (item: TreeItem<never>) => ContextMenuKeyTargetProps) => (
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
      onFocus={onFocus}
      onScroll={virtual ? (e) => win.onScroll(e.currentTarget.scrollTop) : undefined}
    >
      {virtual && <div className="cy-tree-space" style={{ blockSize: win.total }} aria-hidden="true" />}
      {win.indices.map((i) => {
        const row = rows[i] as Row;
        const kids = row.item.kind === "group" ? childrenOf(row.item) : undefined;
        return (
          <TreeRow
            key={row.key}
            row={row}
            offset={virtual ? i * rowH : undefined}
            renderLabel={renderLabel}
            renderError={renderError}
            renderEmpty={renderEmpty}
            branch={row.kind === "item" && isBranch(row.item)}
            open={isOpen(row.item.id)}
            selected={row.kind === "item" && pickedSet.has(row.item.id)}
            tabbable={row.key === tabStop}
            busy={statusOf(row.item.id) === "loading"}
            match={row.kind === "item" ? search?.matches.get(row.item.id) : undefined}
            query={query}
            count={kids && (search ? kids.filter((k) => search.shown.has(k.id)).length : kids.length)}
            text={text}
            calls={calls}
            menuFor={menuFor}
            onAction={onAction}
          />
        );
      })}
    </div>
  );

  // One context menu for the tree, opened for whichever row asked. Its panel lands beside the tree, not in it: a tree
  // holds only tree items, even while a menu is open.
  return (
    <ContextMenu<TreeItem<never>>
      label={(item) => menuName(item.label)}
      items={(item) => item.contextMenu ?? []}
      onSelect={(value, item) => onCommand?.(value, item)}
    >
      {(_, targetFor) => tree(targetFor)}
    </ContextMenu>
  );
}

interface TreeRowProps {
  row: Row;
  /** Virtual mode: the row's position from the top of the list. */
  offset: number | undefined;
  renderLabel: ((item: TreeItem<never>, label: ReactNode) => ReactNode) | undefined;
  renderError: ((item: TreeItem<never>, retry: () => void) => ReactNode) | undefined;
  renderEmpty: ((item: TreeItem<never>) => ReactNode) | undefined;
  branch: boolean;
  open: boolean;
  selected: boolean;
  tabbable: boolean;
  busy: boolean;
  /** How the item matched the filter, if it did. */
  match: Match | undefined;
  /** The filter text, for marking a string match. */
  query: string;
  /** A group's number of (shown) children, when known. */
  count: number | undefined;
  text: Pick<TreeLabels, "loading" | "failed">;
  calls: {
    click: (row: Row, onChevron: boolean, additive: boolean) => void;
    retry: (item: TreeItem<never>) => void;
    command: (value: string, item: TreeItem<never>) => void;
  };
  /** The props that make a row a target of the tree's one context menu (stable). */
  menuFor: (item: TreeItem<never>) => ContextMenuKeyTargetProps;
  onAction: ((item: TreeItem<never>) => void) | undefined;
}

/** Memoised so that moving focus or selection re-renders two rows, not the whole tree. */
const TreeRow = memo(function TreeRow({
  row,
  offset,
  renderLabel,
  renderError,
  renderEmpty,
  branch,
  open,
  selected,
  tabbable,
  busy,
  match,
  query,
  count,
  text,
  calls,
  menuFor,
  onAction,
}: TreeRowProps) {
  const id = useId();
  const { item, level, kind } = row;
  const group = kind === "item" && item.kind === "group";
  const usable = kind !== "loading" && !item.disabled;
  const actions = kind === "item" ? item.actions : undefined;
  const menu = kind === "item" && item.contextMenu && !item.disabled;
  const trailing = kind !== "item" ? undefined : (item.trailing ?? (group ? count : undefined));

  let content: ReactNode;
  if (kind === "item") {
    const shown = match ? (
      <HighlightedText
        text={item.label}
        positions={match === true ? undefined : match}
        query={match === true ? query : undefined}
      />
    ) : (
      item.label
    );
    content = (
      <>
        <OptionIcon option={item} plain={item.disabled} className="cy-tree-icon" />
        <span id={`${id}-label`} className="cy-tree-label cy-reset">
          {renderLabel ? renderLabel(item, shown) : shown}
        </span>
      </>
    );
  } else if (kind === "failed" && renderError) {
    content = <span className="cy-tree-note cy-reset">{renderError(item, () => calls.retry(item))}</span>;
  } else if (kind === "empty") {
    content = <span className="cy-tree-note cy-reset">{renderEmpty?.(item)}</span>;
  } else {
    content = (
      <span className="cy-tree-note cy-reset">
        {kind === "loading" && <LoadingDots size="sm" />}
        {kind === "loading" ? text.loading : text.failed}
      </span>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the tree handles keys for every row (roving focus)
    <div
      role="treeitem"
      data-key={row.key}
      data-kind={kind}
      data-group={group || undefined}
      className="cy-tree-row cy-reset"
      aria-level={level}
      aria-posinset={row.pos}
      aria-setsize={row.setSize}
      aria-expanded={branch ? open : undefined}
      aria-selected={kind === "item" && !group ? selected : undefined}
      aria-disabled={kind === "loading" || item.disabled || undefined}
      aria-busy={busy || undefined}
      // With action buttons inside, the row is named by its label and trailing text only, not by the buttons too.
      aria-labelledby={
        actions?.length || trailing !== undefined
          ? `${id}-label${trailing !== undefined ? ` ${id}-trailing` : ""}`
          : undefined
      }
      // Disabled and loading rows never take focus, not even from a click.
      tabIndex={usable ? (tabbable ? 0 : -1) : undefined}
      style={{ "--_level": level - 1, insetBlockStart: offset } as CSSProperties}
      onClick={(e) => {
        if (onControl(e)) return;
        const onChevron = (e.target as Element).closest(".cy-tree-chevron") !== null;
        calls.click(row, onChevron, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        if (onControl(e) || kind !== "item" || group || item.disabled) return;
        if (!(e.target as Element).closest(".cy-tree-chevron")) onAction?.(item);
      }}
      // A row with commands is one of the targets of the tree's context menu (and says Shift+F10 opens it).
      {...(menu && menuFor(item))}
    >
      <span className="cy-tree-chevron cy-reset" data-open={open || undefined} aria-hidden="true">
        {branch && <Icon icon={chevronRight} size="sm" />}
      </span>
      {content}
      {trailing !== undefined && (
        <>
          {/* A space between the label and the trailing text, so the row's text reads "users 1.2k" (the row is a flex
              box, so it is not drawn). */}{" "}
          <span id={`${id}-trailing`} className="cy-tree-trailing cy-reset">
            {trailing}
          </span>
        </>
      )}
      {actions?.length ? (
        // Shown while the row is hovered, holds focus or is selected; only the focused row's buttons are in the Tab
        // order, right after it.
        <RowActions className="cy-tree-actions" tabbable={tabbable} shown={selected}>
          {actions.map((action) => (
            <IconButton
              key={action.value}
              icon={action.icon}
              label={action.label}
              disabled={action.disabled}
              size="xs"
              variant="ghost"
              tone="neutral"
              onClick={() => calls.command(action.value, item)}
            />
          ))}
        </RowActions>
      ) : null}
    </div>
  );
});
