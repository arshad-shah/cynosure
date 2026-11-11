import type { CSSProperties, ReactNode } from "react";
import { type FieldRender, useField } from "../../foundations/field.js";
import type { Size } from "../../tokens/schema.js";

export interface FieldTokens {
  gap: string;
  labelWeight: string;
  labelColor: string;
  descriptionColor: string;
  errorColor: string;
  requiredColor: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    field: FieldTokens;
  }
}

export interface FieldProps {
  /** Visible label; it names the control. */
  label: ReactNode;
  /** Help text shown below the control and read out with it. */
  description?: ReactNode | undefined;
  /** Shown below the control, announced, and marks the control invalid. */
  error?: ReactNode | undefined;
  /** Draws the required marker; pass `required` to the control too. */
  required?: boolean | undefined;
  /** Size of the label text. Default "md". */
  size?: Size | undefined;
  /** Keep the label for assistive tech but take no space (toolbars, dense rows). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Label a group of controls (radio groups) instead of one control. */
  group?: boolean | undefined;
  /** Id for the control; the label, description and error ids are built from it. Default: a generated id. */
  id?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string | undefined;
  /** Layout only. */
  style?: CSSProperties | undefined;
  /** Renders the control from the ids and state in `field`. */
  children: (field: FieldRender) => ReactNode;
}

/** Label, description and error wiring for any control. Controls render through `children(field)`. */
export function Field({
  label,
  description,
  error,
  required,
  size = "md",
  group,
  labelHidden,
  id,
  className,
  style,
  children,
}: FieldProps) {
  const field = useField({ id, description, error });
  const body = (
    <>
      {group ? (
        <span
          id={field.labelId}
          className="cy-field-label"
          data-required={required ? "" : undefined}
          data-hidden={labelHidden ? "" : undefined}
        >
          {label}
        </span>
      ) : (
        <label
          id={field.labelId}
          htmlFor={field.id}
          className="cy-field-label"
          data-required={required ? "" : undefined}
          data-hidden={labelHidden ? "" : undefined}
        >
          {label}
        </label>
      )}
      {children(field)}
      {description && (
        <span id={field.descriptionId} className="cy-field-description">
          {description}
        </span>
      )}
      {field.invalid && (
        <span id={field.errorId} className="cy-field-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
  const props = { className: `cy-field${className ? ` ${className}` : ""}`, "data-size": size, style };
  return group ? (
    <fieldset {...props} aria-labelledby={field.labelId} aria-describedby={field.describedBy}>
      {body}
    </fieldset>
  ) : (
    <div {...props}>{body}</div>
  );
}
