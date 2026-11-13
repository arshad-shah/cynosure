import {
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { iconSizeFor } from "../../foundations/icon-size.js";
import { close } from "../../icons/close.js";
import { eye } from "../../icons/eye.js";
import { eyeOff } from "../../icons/eye-off.js";
import type { IconData } from "../../icons/types.js";
import type { DenseSize } from "../../tokens/schema.js";
import { Field, type FieldLayoutProps } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface TextFieldTokens {
  paddingInlineXs: string;
  heightXs: string;
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  paddingInline: string;
  bg: string;
  border: string;
  softBg: string;
  /** `font-variant-numeric` of the typed text: `tabular-nums` lines digits up (DateField, NumberField, TimeField). */
  numeric: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    textField: TextFieldTokens;
  }
}

type NativeInput = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "size"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onSubmit"
  | "type"
  | "className"
  | "style"
  | "children"
  | "width"
>;

export interface TextFieldProps extends NativeInput, FieldLayoutProps {
  /** The field's label and accessible name. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Error message shown below the field; it is announced and marks the field invalid. */
  error?: ReactNode;
  /** The text (controlled). */
  value?: string;
  /** Starting text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onChange?: (value: string) => void;
  /** The native input type. Default "text". */
  type?: "text" | "email" | "url" | "tel" | "password" | "number" | "search";
  /**
   * Field height and text size. Default "md". `xs` (about 20px) is for dense desktop chrome: the input still reaches
   * 24px to press (44px on coarse pointers), and the clear and reveal buttons shrink with it. Its label is set as for
   * `sm`. Addons keep their own size.
   */
  size?: DenseSize;
  /** `outline` (default) or `soft` (tinted, borderless until focus). */
  variant?: "outline" | "soft";
  /** Icon shown before the input. */
  iconStart?: IconData | undefined;
  /** Icon shown at the end of the field, after the input and its clear or reveal button. */
  iconEnd?: IconData | undefined;
  /** Shows a clear button while the field has a value. */
  clearable?: boolean;
  /** Controls inside the field's start, before the input (ColorField's swatch button). */
  addonStart?: ReactNode;
  /** Controls inside the field's end, after the input (NumberField's steppers). */
  addonEnd?: ReactNode;
  /** Replace the built-in English text: the names of the clear, show and hide buttons. */
  labels?: { clear?: string; show?: string; hide?: string };
  /** With `type="password"`: a button to show and hide the value (API keys, tokens, passwords). */
  revealable?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /**
   * The field's box (the input with its icons, addons and buttons), for a list or popover that drops from the whole
   * field (Combobox, TagInput). Use it to measure or anchor; restyle through tokens, not its class.
   */
  boxRef?: Ref<HTMLDivElement> | undefined;
  /** Test id, set on the native input. */
  "data-testid"?: string;
}

const setNativeValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

/** Single-line text input with label, description, error, icons and an optional clear button. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    labelHidden,
    description,
    layout,
    width,
    error,
    value,
    defaultValue,
    onChange,
    type = "text",
    size = "md",
    variant = "outline",
    iconStart,
    iconEnd,
    clearable = false,
    revealable = false,
    addonStart,
    addonEnd,
    boxRef,
    labels,
    required,
    disabled,
    id,
    className,
    style,
    onKeyDown,
    ...rest
  },
  forwarded,
) {
  const inner = useRef<HTMLInputElement | null>(null);
  const dense = size === "xs";
  const iconSize = iconSizeFor(size);
  const [shown, setShown] = useState(false);
  const secret = type === "password" && revealable;
  const [filled, setFilled] = useState(Boolean(value ?? defaultValue));
  const controlled = value !== undefined;
  useEffect(() => {
    if (controlled) setFilled(Boolean(value));
  }, [controlled, value]);
  useEffect(() => {
    const form = inner.current?.form;
    if (!form) return;
    // After the browser restores the default value on reset, sync the clear button.
    const onReset = () => requestAnimationFrame(() => setFilled(Boolean(inner.current?.value)));
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);
  const ref = useCallback(
    (node: HTMLInputElement | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );
  const clear = () => {
    if (!inner.current) return;
    setNativeValue(inner.current, "");
    inner.current.focus();
  };

  return (
    <Field
      label={label}
      labelHidden={labelHidden}
      layout={layout}
      width={width}
      description={description}
      error={error}
      required={required}
      size={size}
      id={id}
      className={className}
      style={style}
    >
      {(field) => (
        <div
          ref={boxRef}
          className="cy-text-field"
          data-size={size}
          data-variant={variant}
          data-invalid={field.invalid ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
        >
          {addonStart}
          {iconStart && <Icon icon={iconStart} size={iconSize} className="cy-text-field-icon" />}
          <InputBase
            ref={ref}
            {...rest}
            id={field.id}
            type={secret && shown ? "text" : type}
            className="cy-text-field-input"
            aria-describedby={field.describedBy}
            invalid={field.invalid}
            required={required}
            disabled={disabled}
            {...(controlled ? { value } : { defaultValue })}
            onChange={(e) => {
              setFilled(Boolean(e.currentTarget.value));
              onChange?.(e.currentTarget.value);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e)}
          />
          {clearable && filled && !disabled && (
            <IconButton
              icon={close}
              label={labels?.clear ?? "Clear"}
              variant="ghost"
              size={dense ? "xs" : "sm"}
              onClick={clear}
              className="cy-text-field-clear"
            />
          )}
          {secret && !disabled && (
            <IconButton
              icon={shown ? eyeOff : eye}
              label={shown ? (labels?.hide ?? "Hide") : (labels?.show ?? "Show")}
              aria-pressed={shown}
              variant="ghost"
              size={dense ? "xs" : "sm"}
              onClick={() => setShown(!shown)}
              className="cy-text-field-clear"
            />
          )}
          {iconEnd && <Icon icon={iconEnd} size={iconSize} className="cy-text-field-icon" />}
          {addonEnd}
        </div>
      )}
    </Field>
  );
});
