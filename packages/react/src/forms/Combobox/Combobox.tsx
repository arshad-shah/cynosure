import { ChevronDownIcon } from 'lucide-react';
import { type CSSProperties, type ReactNode, forwardRef } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Input as AriaInput,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  type ListBoxItemProps,
} from 'react-aria-components';
import { cn } from '../../utils/cn.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import { listbox, listboxEmpty, listboxItem, popover } from '../shared/popover.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
export interface ComboboxItemData<T extends string = string> {
  value: T;
  label: ReactNode;
  textValue?: string;
  disabled?: boolean;
}

export interface ComboboxOwnProps<T extends string = string> {
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  /** Current text in the input — separate from the selected key. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  'aria-label'?: string;
  size?: FormControlSize;
  variant?: FormControlVariant;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Allow values the user types that aren't in the list. */
  allowsCustomValue?: boolean;
  /** Data-driven items; overrides `children`. */
  items?: ReadonlyArray<ComboboxItemData<T>>;
  /** JSX children (`<ComboboxItem>`). */
  children?: ReactNode;
  /** Rendered when the filtered list is empty. */
  emptyState?: ReactNode;
  className?: string;
  style?: CSSProperties;
  name?: string;
  id?: string;
}

type NativeComboboxProps = Omit<
  AriaComboBoxProps<object>,
  | 'children'
  | 'className'
  | 'style'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
  | 'inputValue'
  | 'defaultInputValue'
  | 'onInputChange'
  | 'isDisabled'
  | 'isRequired'
  | 'isInvalid'
  | 'allowsCustomValue'
>;

export type ComboboxProps<T extends string = string> = ComboboxOwnProps<T> & NativeComboboxProps;

const stringify = (label: ReactNode): string | undefined =>
  typeof label === 'string' ? label : typeof label === 'number' ? String(label) : undefined;

/** Autocomplete input with a filtered dropdown list. Wraps React Aria ComboBox. */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps<string>>(
  function Combobox(props, ref) {
    const {
      value,
      defaultValue,
      onValueChange,
      inputValue,
      defaultInputValue,
      onInputChange,
      placeholder = 'Search…',
      size = 'md',
      variant = 'outline',
      disabled,
      required,
      invalid,
      allowsCustomValue,
      items,
      children,
      emptyState,
      className,
      style,
      label,
      ...rest
    } = props;

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    const body = items
      ? items.map((item) => (
          <ComboboxItem
            key={item.value}
            id={item.value}
            textValue={item.textValue ?? stringify(item.label)}
            isDisabled={item.disabled}
          >
            {item.label}
          </ComboboxItem>
        ))
      : children;

    return (
      <AriaComboBox
        {...rest}
        aria-label={rest['aria-label'] ?? label}
        selectedKey={value as string | null | undefined}
        defaultSelectedKey={defaultValue as string | null | undefined}
        onSelectionChange={(key) => {
          onValueChange?.(key === null ? null : String(key));
        }}
        inputValue={inputValue}
        defaultInputValue={defaultInputValue}
        onInputChange={onInputChange}
        isDisabled={disabled}
        isRequired={required}
        isInvalid={invalid}
        allowsCustomValue={allowsCustomValue}
      >
        <div
          className={wrapperClass}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          style={style}
        >
          <AriaInput
            ref={ref}
            placeholder={placeholder}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              padding: 0,
            }}
          />
          <AriaButton
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'currentColor',
              padding: '0 0.5rem',
            }}
            aria-label="Open options"
          >
            <ChevronDownIcon />
          </AriaButton>
        </div>
        <AriaPopover className={popover} style={{ width: 'var(--trigger-width)' }}>
          <AriaListBox
            className={listbox}
            renderEmptyState={emptyState ? () => emptyState : undefined}
          >
            {body}
          </AriaListBox>
        </AriaPopover>
      </AriaComboBox>
    );
  },
) as <T extends string = string>(
  props: ComboboxProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;

export interface ComboboxItemProps extends Omit<ListBoxItemProps, 'className'> {
  className?: string;
  children?: ReactNode;
}

export function ComboboxItem({ className, children, ...rest }: ComboboxItemProps) {
  return (
    <AriaListBoxItem {...rest} className={cn(listboxItem, className)}>
      {children}
    </AriaListBoxItem>
  );
}

export interface ComboboxEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function ComboboxEmpty({ children = 'No results', className }: ComboboxEmptyProps) {
  return <div className={cn(listboxEmpty, className)}>{children}</div>;
}
