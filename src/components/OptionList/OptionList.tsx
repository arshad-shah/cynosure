import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";

export interface OptionListTokens {
  bg: string;
  shadow: string;
  maxHeight: string;
  maxWidth: string;
  activeBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    optionList: OptionListTokens;
  }
}

/** An action at the foot of a field's list ("Manage connections…"): Select's and Combobox's `footer`. */
export interface OptionListAction {
  /** The action's text. */
  label: string;
  /** Icon before the text. */
  icon?: IconData;
  /** Runs the action, after the list has closed. The field's value does not change. */
  onSelect: () => void;
}

export interface OptionListProps {
  /** The list's id: the field's `aria-controls`, and the prefix of the options' ids. */
  id: string;
  /** Accessible name, when no visible label names the list through `aria-labelledby`. */
  label?: string | undefined;
  /** The id of the visible label that names the list. */
  "aria-labelledby"?: string | undefined;
  /** Options are still loading (`aria-busy`). */
  busy?: boolean | undefined;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-option-list-* tokens. */
  style?: CSSProperties;
  /** OptionListItem, OptionListNote and OptionListGroup. */
  children?: ReactNode;
  /**
   * An action pinned under the options, set off by a line and kept in view while they scroll ("Manage
   * connections…"). The list draws it as an option (a listbox holds only options), so the field's arrow keys reach it
   * after the last option and Enter runs it, while focus stays in the field. Select's and Combobox's `footer`.
   */
  footer?: OptionListFooter | undefined;
}

/** The footer row: an action the list draws and the field that owns the list runs. */
export interface OptionListFooter {
  /** The action: its label, icon and what it does. */
  action: OptionListAction;
  /** The row's id, the target of the field's `aria-activedescendant` (with `useActiveOption`, `optionId(count)`). */
  id: string;
  /** The arrow keys are on it (highlighted). */
  active: boolean;
  /** The pointer moved over it: make it the active option. */
  onActive: () => void;
  /** A press on it: close the list, then run the action. */
  onRun: () => void;
}

/**
 * The drop-down list of options under a field: Select, Combobox, TagInput and TextArea's mentions draw their lists
 * with it. It is a manual popover; show, place and dismiss it with `useListboxLayer`, and move the active option with
 * `aria-activedescendant` from the field, which keeps focus.
 */
export const OptionList = forwardRef<HTMLDivElement, OptionListProps>(function OptionList(
  { id, label, "aria-labelledby": labelledBy, busy, className, style, children, footer },
  ref,
) {
  return (
    <div
      ref={ref}
      id={id}
      role="listbox"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-busy={busy || undefined}
      className={`cy-option-list${className ? ` ${className}` : ""}`}
      style={style}
      {...{ popover: "manual" }}
    >
      {children}
      {footer && (
        <div role="none" className="cy-option-list-footer cy-reset">
          <OptionListItem
            id={footer.id}
            label={footer.action.label}
            icon={footer.action.icon && <Icon icon={footer.action.icon} className="cy-option-list-icon" />}
            active={footer.active}
            onPointerMove={footer.onActive}
            onClick={footer.onRun}
          />
        </div>
      )}
    </div>
  );
});

export interface OptionListItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "tabIndex" | "className" | "style" | "children"> {
  /** The option's id, the target of the field's `aria-activedescendant`. */
  id: string;
  /** The option's text. */
  label: ReactNode;
  /** A second, muted line under the label. */
  description?: ReactNode;
  /** Drawn before the text: the option's icon. */
  icon?: ReactNode;
  /** The chosen option (`aria-selected`). */
  selected?: boolean;
  /** The option the arrow keys are on (highlighted). */
  active?: boolean;
  /** Shown but not choosable (`aria-disabled`). */
  disabled?: boolean | undefined;
  /** Drawn at the end of the row, smaller and muted: a shortcut, a count. */
  trailing?: ReactNode;
  /** Drawn muted but still choosable: an option that is there but not in use (a saved, unconnected connection). */
  dimmed?: boolean | undefined;
}

/** One option of an OptionList. A press never moves focus out of the field the list drops down from. */
export function OptionListItem({
  id,
  label,
  description,
  icon,
  selected = false,
  active = false,
  disabled,
  trailing,
  dimmed,
  onPointerDown,
  ...rest
}: OptionListItemProps) {
  return (
    <div
      {...rest}
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-active={active ? "" : undefined}
      data-dimmed={dimmed ? "" : undefined}
      className="cy-option-list-option"
      tabIndex={-1}
      onPointerDown={(event) => {
        // Keep focus in the field: the options are aria-activedescendant targets.
        event.preventDefault();
        onPointerDown?.(event);
      }}
      onKeyDown={rest.onKeyDown ?? (() => {})}
    >
      {icon}
      <span className="cy-option-list-text">
        <span className="cy-option-list-label">{label}</span>
        {description && <span className="cy-option-list-description">{description}</span>}
      </span>
      {trailing && <span className="cy-option-list-trailing">{trailing}</span>}
    </div>
  );
}

export interface OptionListNoteProps {
  /** The text: "No matches", "Loading…". */
  children: ReactNode;
}

/** A line in place of options (nothing matches, still loading): an option that cannot be chosen. */
export function OptionListNote({ children }: OptionListNoteProps) {
  return (
    <div
      role="option"
      aria-disabled="true"
      aria-selected="false"
      tabIndex={-1}
      className="cy-option-list-note"
    >
      {children}
    </div>
  );
}

export interface OptionListGroupProps {
  /** The heading's id (it names the group). */
  id: string;
  /** The heading: small and muted, passed over by the arrow keys. */
  label: ReactNode;
  /** The group's OptionListItems. */
  children: ReactNode;
}

/** A labelled run of options inside an OptionList. */
export function OptionListGroup({ id, label, children }: OptionListGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of options inside a listbox; a fieldset is a form control
    <div role="group" aria-labelledby={id} className="cy-option-list-group cy-reset">
      <div id={id} className="cy-option-list-group-label" role="presentation">
        {label}
      </div>
      {children}
    </div>
  );
}
