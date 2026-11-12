import {
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import { chevronDown } from "../../icons/chevron-down.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface SideNavTokens {
  /** Width of the expanded navigation. */
  width: string;
  /** Width of the collapsed, icon-only rail. */
  railWidth: string;
  /** Corner radius of item highlights. */
  radius: string;
  /** Diameter of the round action button in the bar. */
  actionSize: string;
  /** How far the action button rises above the bar's row. */
  actionLift: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    sideNav: SideNavTokens;
  }
}

export interface NavItem {
  id: string;
  label: string;
  /** A link. Without it the item is a button that calls `onNavigate` (or, with `items`, a group). */
  href?: string;
  icon?: IconData;
  /** A count or status after the label, e.g. a Badge. Read as part of the item's name. */
  badge?: ReactNode;
  /** Child items: the item becomes a group that expands and collapses. */
  items?: NavItem[];
  disabled?: boolean;
}

export interface NavSection {
  /** Heading shown above the section's items. */
  label: string;
  items: NavItem[];
}

/**
 * A primary action among the items, such as "Add": a button, not a place. It is never the current page (even when
 * its `id` equals `current`), does not call `onNavigate`, and belongs at the top level, not in a section or group.
 * In a bar it is a raised round accent button showing only the icon; in the column, a filled accent button with the
 * icon and label; in the collapsed rail, a filled icon button. Give a navigation one at most.
 */
export interface NavAction {
  /** Marks the entry as an action instead of a destination. */
  kind: "action";
  /** Unique among the entries. */
  id: string;
  /** The button's accessible name; its visible text in the column, a tooltip in the bar and the rail. */
  label: string;
  /** The Facet icon shown in the button. */
  icon: IconData;
  /** Called when the action is pressed. */
  onClick: (event: MouseEvent<HTMLElement>) => void;
  /** The button cannot be pressed. */
  disabled?: boolean;
}

export type NavEntry = NavItem | NavSection | NavAction;

/** What `renderLink` receives: spread it onto your router's link component. */
export interface NavLinkProps {
  /** The item's `href`. */
  href: string;
  /** The item's styling; keep it on the link. */
  className: string;
  /** Set to "page" on the current item. */
  "aria-current"?: "page";
  /** Calls `onNavigate` with the item's id; keep it on the link. */
  onClick: (event: MouseEvent<HTMLElement>) => void;
  /** The item's icon, label and badge. */
  children: ReactNode;
}

export interface SideNavProps {
  /** Accessible name of the navigation landmark, e.g. "Main". */
  label: string;
  /**
   * Items and sections (`{ label, items }`), in order. One entry may be a primary action
   * (`{ kind: "action", id, label, icon, onClick }`): a button that sits where it is placed.
   */
  items: NavEntry[];
  /** `id` of the page being shown: marked `aria-current="page"`; groups holding it start expanded. */
  current?: string | undefined;
  /** Called when an item is chosen (links too: call `event.preventDefault()` to route on the client). */
  onNavigate?: ((id: string, event: MouseEvent<HTMLElement>) => void) | undefined;
  /** Render links with your router: `(props) => <RouterLink to={props.href} {...props} />`. Default: a plain link. */
  renderLink?: (props: NavLinkProps) => ReactElement;
  /**
   * Icon-only rail; labels show in tooltips and stay the accessible names. Give top-level items icons. Groups do not
   * open inside the rail: choosing one calls `onCollapsedChange(false)` so you can widen the navigation.
   */
  collapsed?: boolean;
  /** Called with `false` when a group is chosen in the collapsed rail. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Group ids expanded at first (groups holding `current` always are). */
  defaultExpanded?: string[];
  /**
   * `column` (default): the vertical navigation. `bar`: one row of top-level items, icon over label, for a phone's
   * bottom tab bar (AppShell's `tabs`). Section headings are left out, and a group is one item that calls `onNavigate`
   * with its id (a bar has no room to open it). Give a bar three to five items, each with an icon.
   */
  layout?: "column" | "bar";
  /** Height and text size of the items. Default "md". */
  size?: Size;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-side-nav-* tokens. */
  style?: CSSProperties;
}

const isSection = (entry: NavEntry): entry is NavSection => !("id" in entry);
const isAction = (entry: NavItem | NavAction): entry is NavAction => "kind" in entry;

/** Ids of the groups that lead to `id`. */
function ancestors(items: NavItem[], id: string | undefined, trail: string[] = []): string[] | null {
  if (!id) return null;
  for (const item of items) {
    if (item.id === id) return trail;
    const found = item.items && ancestors(item.items, id, [...trail, item.id]);
    if (found) return found;
  }
  return null;
}

const defaultLink = (props: NavLinkProps) => <LinkBase {...props} />;

/** Vertical site or app navigation: links in sections, expandable groups, the current page marked, an icon rail. */
export function SideNav({
  label,
  items,
  current,
  onNavigate,
  renderLink = defaultLink,
  collapsed = false,
  onCollapsedChange,
  defaultExpanded = [],
  layout = "column",
  size = "md",
  className,
  style,
}: SideNavProps) {
  const id = useId();
  const bar = layout === "bar";
  const all = items.flatMap((entry) => (isSection(entry) ? entry.items : [entry]));
  const places = all.filter((entry) => !isAction(entry)) as NavItem[];
  const [expanded, setExpanded] = useState(
    () => new Set([...defaultExpanded, ...(ancestors(places, current) ?? [])]),
  );
  const path = ancestors(places, current)?.join(" ");
  // Navigating somewhere else opens the groups on the way to it (never closes any).
  useEffect(() => {
    if (!path) return;
    setExpanded((open) =>
      path.split(" ").every((g) => open.has(g)) ? open : new Set([...open, ...path.split(" ")]),
    );
  }, [path]);

  const toggle = (group: string) =>
    setExpanded((open) => {
      const next = new Set(open);
      if (!next.delete(group)) next.add(group);
      return next;
    });

  const content = (item: NavItem, group?: boolean) => (
    <>
      {item.icon && <Icon icon={item.icon} className="cy-side-nav-icon" />}
      <span className="cy-side-nav-label cy-reset">{item.label}</span>
      {item.badge != null && <span className="cy-side-nav-badge cy-reset">{item.badge}</span>}
      {group && !bar && <Icon icon={chevronDown} className="cy-side-nav-chevron" />}
    </>
  );

  // The primary action: Cynosure's own buttons, so it presses, focuses and names itself like any other button.
  const action = (item: NavAction) => {
    const shared = {
      className: "cy-side-nav-action",
      variant: "solid",
      tone: "accent",
      disabled: item.disabled,
      onClick: item.onClick,
    } as const;
    return bar || collapsed ? (
      <IconButton
        {...shared}
        icon={item.icon}
        label={item.label}
        size={bar ? "lg" : size}
        tooltipPlacement={bar ? "top" : "end"}
      />
    ) : (
      <Button {...shared} icon={item.icon} size={size} fullWidth>
        {item.label}
      </Button>
    );
  };

  const control = (item: NavItem): ReactElement<Record<string, unknown>> => {
    const isCurrent = item.id === current;
    if (item.items && !bar) {
      const open = expanded.has(item.id);
      return (
        <ButtonBase
          className="cy-side-nav-link cy-reset"
          aria-expanded={collapsed ? undefined : open}
          aria-controls={collapsed ? undefined : `${id}-${item.id}`}
          aria-disabled={item.disabled || undefined}
          onClick={() => {
            if (item.disabled) return;
            if (collapsed) {
              // The rail has no room for children: ask for the full navigation with this group open.
              setExpanded((o) => new Set([...o, item.id]));
              onCollapsedChange?.(false);
            } else toggle(item.id);
          }}
        >
          {content(item, true)}
        </ButtonBase>
      );
    }
    const onClick = (event: MouseEvent<HTMLElement>) => {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      onNavigate?.(item.id, event);
    };
    if (item.href && !item.disabled)
      return renderLink({
        href: item.href,
        className: "cy-side-nav-link cy-reset",
        ...(isCurrent ? { "aria-current": "page" as const } : {}),
        onClick,
        children: content(item),
      }) as ReactElement<Record<string, unknown>>;
    return (
      <ButtonBase
        className="cy-side-nav-link cy-reset"
        aria-current={isCurrent ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        onClick={onClick}
      >
        {content(item)}
      </ButtonBase>
    );
  };

  const list = (
    entries: (NavItem | NavAction)[],
    depth: number,
    listId?: string,
    hidden?: boolean,
    labelledBy?: string,
  ) => (
    <ul
      className="cy-side-nav-list cy-reset"
      id={listId}
      hidden={hidden}
      aria-labelledby={labelledBy}
      data-depth={depth}
    >
      {entries.map((item) =>
        isAction(item) ? (
          <li key={item.id} className="cy-side-nav-item cy-reset" data-action="">
            {action(item)}
          </li>
        ) : (
          <li key={item.id} className="cy-side-nav-item cy-reset">
            {collapsed && !bar ? (
              <Tooltip content={item.label} placement="end">
                {control(item)}
              </Tooltip>
            ) : (
              control(item)
            )}
            {item.items &&
              !collapsed &&
              !bar &&
              list(item.items, depth + 1, `${id}-${item.id}`, !expanded.has(item.id))}
          </li>
        ),
      )}
    </ul>
  );

  // Consecutive plain items share one list; each section gets its own heading and list.
  const blocks: ({ section: NavSection } | { items: (NavItem | NavAction)[] })[] = [];
  if (bar) blocks.push({ items: all });
  else
    for (const entry of items) {
      const last = blocks[blocks.length - 1];
      if (isSection(entry)) blocks.push({ section: entry });
      else if (last && "items" in last) last.items.push(entry);
      else blocks.push({ items: [entry] });
    }

  return (
    <nav
      className={className ? `cy-side-nav ${className}` : "cy-side-nav"}
      aria-label={label}
      data-size={size}
      data-collapsed={collapsed && !bar ? "" : undefined}
      data-layout={layout}
      style={style}
    >
      {blocks.map((block, i) =>
        "section" in block ? (
          <div key={`section-${block.section.label}`} className="cy-side-nav-section cy-reset">
            <span className="cy-side-nav-heading cy-reset" id={`${id}-s${i}`}>
              {block.section.label}
            </span>
            {list(block.section.items, 0, undefined, false, `${id}-s${i}`)}
          </div>
        ) : (
          <div key={i} className="cy-side-nav-section cy-reset">
            {list(block.items, 0)}
          </div>
        ),
      )}
    </nav>
  );
}
