import { type CSSProperties, type ReactNode, type TextareaHTMLAttributes, forwardRef } from 'react';
import type { FormControlBase } from '../shared/types.js';
import { TextareaActions } from './TextareaActions.js';
import { TextareaClearButton } from './TextareaClearButton.js';
import type { TextareaResizeMode } from './TextareaContext.js';
import { TextareaCounter } from './TextareaCounter.js';
import { TextareaField } from './TextareaField.js';
import { TextareaFooter } from './TextareaFooter.js';
import { TextareaResizeHandle } from './TextareaResizeHandle.js';
import { TextareaRoot } from './TextareaRoot.js';

export interface TextareaOwnProps extends FormControlBase<string> {
  rows?: number;
  autoResize?: boolean;
  maxRows?: number;
  /** Corner-grip resize axis. Default `"vertical"`; `"none"` removes the grip. */
  resize?: TextareaResizeMode;

  /** Character limit. Soft — typing past it still works but the counter + `aria-invalid` flip. */
  limit?: number;
  /** Force the counter to render even without a `limit`. Implied when `limit` is set. */
  showCount?: boolean;
  /** Renders a clear button in the top-right corner (visible once the field has content). */
  clearable?: boolean;
  /** Footer toolbar contents — rendered inside `<TextareaActions>` on the left of the footer. */
  toolbar?: ReactNode;

  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

export type TextareaProps = TextareaOwnProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'rows'
  >;

/**
 * Convenience wrapper — the everyday entry point. Composes the primitive
 * sub-components (`TextareaRoot`, `TextareaField`, `TextareaCounter`, etc.)
 * behind flat feature flags. Break out to the primitives directly when you
 * need a custom layout.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const {
      id,
      name,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      required,
      invalid,
      size = 'md',
      variant = 'outline',
      rows,
      autoResize,
      maxRows,
      resize = 'vertical',
      limit,
      showCount,
      clearable,
      toolbar,
      className,
      style,
      placeholder,
      'aria-describedby': ariaDescribedBy,
      ...rest
    } = props;

    const showCounter = showCount ?? limit != null;
    const showFooter = showCounter || toolbar != null;

    return (
      <TextareaRoot
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        invalid={invalid}
        size={size}
        variant={variant}
        autoResize={autoResize}
        maxRows={maxRows}
        resize={resize}
        limit={limit}
        className={className}
        style={style}
        aria-describedby={ariaDescribedBy}
      >
        <TextareaField ref={ref} rows={rows} placeholder={placeholder} {...rest} />
        {clearable ? <TextareaClearButton /> : null}
        {showFooter ? (
          <TextareaFooter>
            {toolbar != null ? <TextareaActions>{toolbar}</TextareaActions> : <span aria-hidden />}
            {showCounter ? <TextareaCounter /> : <span aria-hidden />}
          </TextareaFooter>
        ) : null}
        <TextareaResizeHandle />
      </TextareaRoot>
    );
  },
);
