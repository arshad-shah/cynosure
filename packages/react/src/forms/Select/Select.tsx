import { Check, ChevronDownIcon } from 'lucide-react';
import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Button as AriaButton,
  Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  Popover as AriaPopover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type ListBoxItemProps,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import {
  listbox,
  listboxEmpty,
  listboxItem,
  listboxSection,
  listboxSectionHeader,
  popover,
} from '../shared/popover.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { itemCheck, trigger, triggerIcon, triggerValue } from './Select.css.js';

/** Shape of a data-driven `<Select>` option. */
export interface SelectItemData<T extends string = string> {
  /** Unique value submitted on selection. */
  value: T;
  /** Visible label. May be any React node. */
  label: ReactNode;
  /** Optional section title — items with the same `section` are grouped together. */
  section?: string;
  /** Disables this option. */
  disabled?: boolean;
}

/** Props specific to `<Select>` (excludes React Aria's internal props). */
export interface SelectOwnProps<T extends string = string> {
  /** Currently selected value (controlled). */
  value?: T | null;
  /** Initial value (uncontrolled). */
  defaultValue?: T | null;
  /** Called when the selection changes. */
  onValueChange?: (value: T) => void;
  /**
   * Shown when nothing is selected.
   * @default "Select…"
   */
  placeholder?: string;
  /** Visible label (rendered as the trigger's accessible name when no children label is passed). */
  label?: string;
  /** Aria label when no visual label is available. */
  'aria-label'?: string;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Visual treatment matching the shared form-control vocabulary.
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Disables interaction. */
  disabled?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /** Renders the invalid state and sets `aria-invalid`. */
  invalid?: boolean;
  /** Submitted form field name. */
  name?: string;
  /** Element id. */
  id?: string;
  /** Data-driven items — overrides `children`. Sections group by `section`. */
  items?: ReadonlyArray<SelectItemData<T>>;
  /** JSX children (`<SelectItem>` / `<SelectSection>`). Ignored when `items` is passed. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

type NativeSelectProps = Omit<
  AriaSelectProps<object>,
  | 'children'
  | 'className'
  | 'style'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
  | 'isDisabled'
  | 'isRequired'
  | 'isInvalid'
>;

export type SelectProps<T extends string = string> = SelectOwnProps<T> & NativeSelectProps;

function renderItemsGroupedBySection<T extends string>(items: ReadonlyArray<SelectItemData<T>>) {
  const hasSections = items.some((item) => item.section !== undefined);
  if (!hasSections) {
    return items.map((item) => (
      <SelectItem key={item.value} id={item.value} textValue={stringifyLabel(item.label)}>
        {item.label}
      </SelectItem>
    ));
  }

  const groups = new Map<string | undefined, Array<SelectItemData<T>>>();
  for (const item of items) {
    const key = item.section;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }

  return Array.from(groups.entries()).map(([section, list]) => (
    <SelectSection key={section ?? '__default__'} title={section}>
      {list.map((item) => (
        <SelectItem key={item.value} id={item.value} textValue={stringifyLabel(item.label)}>
          {item.label}
        </SelectItem>
      ))}
    </SelectSection>
  ));
}

const stringifyLabel = (label: ReactNode): string | undefined => {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return undefined;
};

/**
 * `Select` is a dropdown that picks a single value from a list.
 *
 * - Accepts data-driven `items` (with optional sections) or composed `<SelectItem>` / `<SelectSection>` children.
 * - Reuses the shared `controlWrapper` recipe so visuals match `<Input>` / `<NumberInput>`.
 *
 * Built on React Aria's `Select`. Fully keyboard accessible.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps<string>>(
  function Select(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Select…',
      size = 'md',
      variant = 'outline',
      disabled,
      required,
      invalid,
      items,
      children,
      className,
      style,
      label,
      ...rest
    } = props;

    const body = items ? renderItemsGroupedBySection(items) : children;

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    return (
      <AriaSelect
        {...rest}
        aria-label={rest['aria-label'] ?? label}
        selectedKey={value as string | null | undefined}
        defaultSelectedKey={defaultValue as string | null | undefined}
        onSelectionChange={(key) => {
          if (key === null) return;
          onValueChange?.(String(key));
        }}
        isDisabled={disabled}
        isRequired={required}
        isInvalid={invalid}
      >
        <AriaButton
          ref={ref}
          className={wrapperClass}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          style={style}
        >
          <span className={trigger}>
            <AriaSelectValue className={triggerValue}>
              {({ isPlaceholder, selectedText }) =>
                isPlaceholder ? placeholder : (selectedText ?? '')
              }
            </AriaSelectValue>
            <span className={triggerIcon} aria-hidden="true">
              <ChevronDownIcon />
            </span>
          </span>
        </AriaButton>
        <AriaPopover className={popover} style={{ width: 'var(--trigger-width)' }}>
          <AriaListBox className={listbox}>{body}</AriaListBox>
        </AriaPopover>
      </AriaSelect>
    );
  },
) as <T extends string = string>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;

/** Props for a single `<SelectItem>`. Inherits everything from React Aria's `ListBoxItemProps`. */
export interface SelectItemProps extends Omit<ListBoxItemProps, 'className'> {
  className?: string;
  children?: ReactNode;
}

export function SelectItem({ className, children, textValue, ...rest }: SelectItemProps) {
  const resolvedTextValue = textValue ?? (typeof children === 'string' ? children : undefined);
  return (
    <AriaListBoxItem {...rest} textValue={resolvedTextValue} className={cn(listboxItem, className)}>
      {(renderProps) => (
        <>
          <span>
            {typeof children === 'function'
              ? (children as (values: typeof renderProps) => ReactNode)(renderProps)
              : children}
          </span>
          <span className={itemCheck} aria-hidden="true">
            <Check size={14} />
          </span>
        </>
      )}
    </AriaListBoxItem>
  );
}

/** Props for `<SelectSection>` — visually groups items under an optional header. */
export interface SelectSectionProps {
  /** Section heading. Rendered above the section's items. */
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SelectSection({ title, children, className }: SelectSectionProps) {
  return (
    <AriaListBoxSection className={cn(listboxSection, className)}>
      {title !== undefined ? (
        <AriaHeader className={listboxSectionHeader}>{title}</AriaHeader>
      ) : null}
      {children}
    </AriaListBoxSection>
  );
}

export { listboxEmpty as selectEmptyClass };
