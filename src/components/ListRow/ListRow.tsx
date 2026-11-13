import {
  type CSSProperties,
  createContext,
  forwardRef,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  useContext,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { isRtl } from "../../foundations/dir.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import { useRovingFocus } from "../../foundations/roving-focus.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Badge } from "../Badge/Badge.js";
import { RowActions } from "../RowActions/RowActions.js";

export interface ListRowTokens {
  /** The row's background at rest: the colour of the surface the list sits on (actions are drawn over it). */
  background: string;
  /** Padding at the row's inline start and end. */
  paddingInline: string;
  /** Width of the edge rail of an `active` or toned row. */
  railWidth: string;
  /** How much ink is mixed into a clickable row's background on hover (a percentage). */
  hoverMix: string;
  /** How much of the accent is mixed into an `active` row's background (a percentage). */
  activeMix: string;
  /** How much of the tone is mixed into a toned row's background, the faint wash (a percentage). */
  washMix: string;
  /** Colour of the description, the detail and the trailing slot. */
  metaColor: string;
  /** CSS filter on the leading slot of a `dimmed` row (it stays readable: nothing is faded). */
  dimmedFilter: string;
  /** Colour of the line between rows with `divided`. */
  dividerColor: string;
  /** Space between the leading slot, the text, the trailing slot and the actions. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    listRow: ListRowTokens;
  }
}

export interface ListRowLabels {
  /** Read after the title of an `unread` row. Default "Unread". */
  unread: string;
  /** Read before the title of a row with `tone="danger"`. Default "Error". Empty: nothing is read. */
  danger: string;
  /** Read before the title of a row with `tone="warning"`. Default "Warning". */
  warning: string;
  /** Read before the title of a row with `tone="success"`. Default "Success". */
  success: string;
  /** Read before the title of a row with `tone="info"`. Default "Info". */
  info: string;
}

const DEFAULT_LABELS: ListRowLabels = {
  unread: "Unread",
  danger: "Error",
  warning: "Warning",
  success: "Success",
  info: "Info",
};

const RowsContext = createContext<ListRowLabels | null>(null);

/** Marks a row's own button or link: the items of the list's roving focus. */
const MAIN = "[data-list-row-main]";

/** Whether `el` sits in a popover opened from inside `row` (a Menu's panel), so it belongs to that popover. */
const inPopover = (el: Element, row: Element) => {
  const popover = el.closest("[popover]");
  return !!popover && row.contains(popover);
};

/** The controls in a row's actions slot, in order, without those of a popover opened from them. */
const actionsOf = (row: Element) =>
  [...row.querySelectorAll<HTMLElement>(":scope > .cy-list-row-actions :is(button, a[href])")].filter(
    (el) => !inPopover(el, row),
  );

export interface ListRowsProps {
  /** The rows: `ListRow` elements. */
  children?: ReactNode;
  /** Names the list for assistive technology ("Notifications"), when no heading above it does. */
  label?: string | undefined;
  /** Text size and row padding. Default "md". */
  size?: Size;
  /** A line between rows. Default false. */
  divided?: boolean;
  /** Replace the built-in English text read for unread and toned rows. */
  labels?: Partial<ListRowLabels> | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-list-row-* tokens. */
  style?: CSSProperties;
}

/**
 * The list that holds `ListRow`s: one Tab stop for every clickable row, Up and Down (Home, End) between rows, and
 * Left and Right between a row and its actions. The row marked `active` is the Tab stop until another is used.
 */
export const ListRows = forwardRef<HTMLUListElement, ListRowsProps>(function ListRows(
  { children, label, size = "md", divided = false, labels, className, style },
  ref,
) {
  const root = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLUListElement);
  useRovingFocus(root, { orientation: "vertical", loop: false, selector: MAIN, current: true });

  // Left and Right (mirrored in RTL) move between a row's own control and its actions.
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.defaultPrevented || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    const target = event.target as HTMLElement;
    const row = target.closest(".cy-list-row");
    if (!row || inPopover(target, row)) return;
    const main = row.querySelector<HTMLElement>(`:scope > .cy-list-row-text > ${MAIN}`);
    const controls = [...(main ? [main] : []), ...actionsOf(row)];
    const at = controls.indexOf(target);
    const forward = event.key === (isRtl(row) ? "ArrowLeft" : "ArrowRight");
    const next = controls[forward ? at + 1 : at - 1];
    if (at < 0 || !next) return;
    event.preventDefault();
    next.focus();
  };

  return (
    <RowsContext.Provider value={{ ...DEFAULT_LABELS, ...labels }}>
      <ul
        ref={root}
        // biome-ignore lint/a11y/noRedundantRoles: Safari drops the list role from a list drawn without bullets.
        role="list"
        aria-label={label}
        className={className ? `cy-list-rows ${className}` : "cy-list-rows"}
        data-size={size}
        data-divided={divided ? "" : undefined}
        style={style}
        onKeyDown={onKeyDown}
      >
        {children}
      </ul>
    </RowsContext.Provider>
  );
});

export interface ListRowProps {
  /** The row's title, on one line (cut with an ellipsis unless `wrap`). Names the row's button or link. */
  label: ReactNode;
  /** A first, quieter line under the title. */
  description?: ReactNode;
  /** A second quieter line, under the description. */
  detail?: ReactNode;
  /** Draws the description or the detail in the monospace font (a connection string, a query). */
  mono?: "description" | "detail" | undefined;
  /** Before the text: an `IconTile`, an `Avatar`, an `Icon` or a `Badge` status dot. */
  leading?: ReactNode;
  /** After the text: a time, a count, a `Badge`. Plain content, never a control (put controls in `actions`). */
  trailing?: ReactNode;
  /**
   * Controls for this row (`IconButton`s, a `Menu`), drawn over the trailing slot while the row is hovered or has
   * focus, and always shown where there is no hover (touch). Tab from the row, or Right, reaches them.
   */
  actions?: ReactNode;
  /** The open or selected entry: an accent rail on the inline start and a tinted background; `aria-current`. */
  active?: boolean;
  /** Not read yet: a bold title and an accent dot, and "Unread" after the title for assistive technology. */
  unread?: boolean;
  /** Seen or inactive: a muted title and a grey leading slot. */
  dimmed?: boolean;
  /** A coloured rail and a faint wash (an error or warning entry); the tone's word is read before the title. */
  tone?: Tone | undefined;
  /** Lets the title wrap onto more lines instead of cutting it. Default false. */
  wrap?: boolean;
  /** Makes the row a button. */
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  /** Makes the row a link (rendered through LinkBase, so unsafe schemes are not linked). Wins over a button. */
  href?: string | undefined;
  /** Added to the row (`li`), for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-list-row-* tokens. */
  style?: CSSProperties;
}

/**
 * One entry of a `ListRows` list (a notification, a saved query, a connection): a leading slot, a title with up to two
 * quieter lines, a trailing slot, and actions shown on hover or focus. With `onClick` or `href` the row is a button or
 * a link, and its actions are siblings of it, never inside it.
 */
export const ListRow = forwardRef<HTMLLIElement, ListRowProps>(function ListRow(
  {
    label,
    description,
    detail,
    mono,
    leading,
    trailing,
    actions,
    active = false,
    unread = false,
    dimmed = false,
    tone,
    wrap = false,
    onClick,
    href,
    className,
    style,
  },
  ref,
) {
  const labels = useContext(RowsContext);
  const main = useRef<HTMLElement>(null);
  if (!labels) throw new Error("<ListRow> must be inside <ListRows>");
  const id = useId();
  const toneWord = tone && tone !== "accent" && tone !== "neutral" ? labels[tone] : "";
  const ids = (parts: [string, unknown][]) =>
    parts
      .filter(([, shown]) => shown)
      .map(([part]) => `${id}-${part}`)
      .join(" ") || undefined;
  // The button or link holds only the title (named with the tone's word and "Unread"); its ::before covers the row,
  // so a press anywhere on it lands there. Everything else is described by the rest of the row, outside it.
  const title = (
    <>
      {toneWord && (
        <span id={`${id}-tone`} className="cy-visually-hidden">
          {toneWord}
        </span>
      )}
      <span id={`${id}-label`} className="cy-list-row-label">
        {label}
      </span>
      {unread && (
        <span id={`${id}-unread`} className="cy-visually-hidden">
          {labels.unread}
        </span>
      )}
    </>
  );
  const control = {
    className: "cy-list-row-main",
    "data-list-row-main": "",
    "aria-labelledby": ids([
      ["tone", toneWord],
      ["label", true],
      ["unread", unread],
    ]),
    "aria-describedby": ids([
      ["leading", leading != null],
      ["description", description != null],
      ["detail", detail != null],
      ["trailing", trailing != null],
    ]),
  };
  return (
    <li
      ref={ref}
      className={className ? `cy-list-row ${className}` : "cy-list-row"}
      data-tone={tone}
      data-active={active ? "" : undefined}
      data-unread={unread ? "" : undefined}
      data-dimmed={dimmed ? "" : undefined}
      data-wrap={wrap ? "" : undefined}
      data-interactive={href != null || onClick ? "" : undefined}
      style={style}
    >
      {leading != null && (
        <span id={`${id}-leading`} className="cy-list-row-leading cy-reset">
          {leading}
        </span>
      )}
      <span className="cy-list-row-text cy-reset">
        {href != null ? (
          <LinkBase
            {...control}
            ref={main as RefObject<HTMLAnchorElement>}
            href={href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
          >
            {title}
          </LinkBase>
        ) : onClick ? (
          <ButtonBase
            {...control}
            ref={main as RefObject<HTMLButtonElement>}
            onClick={onClick}
            aria-current={active ? "true" : undefined}
          >
            {title}
          </ButtonBase>
        ) : (
          <span className="cy-list-row-main">{title}</span>
        )}
        {description != null && (
          <span
            id={`${id}-description`}
            className="cy-list-row-description"
            data-mono={mono === "description" ? "" : undefined}
          >
            {description}
          </span>
        )}
        {detail != null && (
          <span
            id={`${id}-detail`}
            className="cy-list-row-detail"
            data-mono={mono === "detail" ? "" : undefined}
          >
            {detail}
          </span>
        )}
      </span>
      {(trailing != null || unread) && (
        <span className="cy-list-row-trailing">
          {trailing != null && (
            <span id={`${id}-trailing`} className="cy-list-row-trailing-content cy-reset">
              {trailing}
            </span>
          )}
          {/* The dot is drawn only: "Unread" is read with the title. */}
          {unread && (
            <span className="cy-list-row-dot cy-reset" aria-hidden="true">
              <Badge dot tone="accent" label={labels.unread} />
            </span>
          )}
        </span>
      )}
      {/* The actions of the row holding the Tab stop (and of a row that cannot be pressed) are in the Tab order: Tab
          from a row reaches its actions, then leaves the list. Everyone else's are reached with the arrows. */}
      {actions != null && (
        <RowActions className="cy-list-row-actions" tabbable={main}>
          {actions}
        </RowActions>
      )}
    </li>
  );
});
