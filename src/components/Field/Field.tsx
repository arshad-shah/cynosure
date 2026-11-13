import type { CSSProperties, ReactNode } from "react";
import { type FieldRender, useField } from "../../foundations/field.js";
import type { DenseSize } from "../../tokens/schema.js";

export interface FieldTokens {
  /** Border colour of every field's box (TextField, HotkeyField), under each control's own token. Default --cy-color-line. */
  controlBorder: string;
  /** Background of every field's box (TextField, HotkeyField), under each control's own token. Default --cy-color-surface. */
  controlBg: string;
  /** Corner radius of every field's box (TextField, HotkeyField). Default the control height times the radius factor. */
  controlRadius: string;
  /** Sunken fill of a box that cannot be edited: a read-only TextField, a disabled HotkeyField. Default --cy-color-soft. */
  controlSunkenBg: string;
  /** Narrowest the label and description get in the split layout before the control moves under them. Default 192px. */
  splitTextMin: string;
  /** Width of the control at `width="lg"`. Default 384px. */
  controlWidthLg: string;
  /** Width of the control at `width="md"`. Default 256px. */
  controlWidthMd: string;
  /** Width of the control at `width="sm"`. Default 160px. */
  controlWidthSm: string;
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

/** Width of a Field's control: three steps from the `--cy-field-control-width-*` tokens, or the whole field. */
export type FieldWidth = "sm" | "md" | "lg" | "full";

/** How a Field lays out its label and control. Every control built on Field takes these and passes them on. */
export interface FieldLayoutProps {
  /**
   * `stack` puts the label above the control and the description and error below it. `split` puts the label and
   * description at the start and the control at the end of one row (a settings row); when the field is too narrow for
   * both, the control moves under the text. Default "stack".
   */
  layout?: "stack" | "split" | undefined;
  /**
   * Width of the control, so the controls of a column of fields line up: "sm", "md" and "lg" are the
   * `--cy-field-control-width-*` tokens (never wider than the field), "full" is the whole field. Default: the control's
   * own width (the whole field in the stacked layout for TextField and the other fields).
   */
  width?: FieldWidth | undefined;
}

export interface FieldProps extends FieldLayoutProps {
  /** Visible label; it names the control. */
  label: ReactNode;
  /** Help text shown below the control and read out with it. */
  description?: ReactNode | undefined;
  /** Shown below the control, announced, and marks the control invalid. */
  error?: ReactNode | undefined;
  /** Draws the required marker; pass `required` to the control too. */
  required?: boolean | undefined;
  /** Size of the label text, matching the control's size (an `xs` control has the `sm` label). Default "md". */
  size?: DenseSize | undefined;
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
  layout = "stack",
  width,
  group,
  labelHidden,
  id,
  className,
  style,
  children,
}: FieldProps) {
  const field = useField({ id, description, error });
  // A hidden label stays in the accessibility tree; out of the flow, the grid gap collapses with it.
  const labelClass = labelHidden ? "cy-field-label cy-visually-hidden" : "cy-field-label";
  const split = layout === "split";
  const labelEl = group ? (
    <span id={field.labelId} className={labelClass} data-required={required ? "" : undefined}>
      {label}
    </span>
  ) : (
    <label
      id={field.labelId}
      htmlFor={field.id}
      className={labelClass}
      data-required={required ? "" : undefined}
    >
      {label}
    </label>
  );
  const descriptionEl = description && (
    <span id={field.descriptionId} className="cy-field-description">
      {description}
    </span>
  );
  // The control is wrapped only when the layout or a width needs a box of its own; otherwise it stays a direct child.
  const control =
    split || width ? (
      <div className="cy-field-control cy-reset" data-width={width}>
        {children(field)}
      </div>
    ) : (
      children(field)
    );
  const body = (
    <>
      {split ? (
        <div className="cy-field-text cy-reset">
          {labelEl}
          {descriptionEl}
        </div>
      ) : (
        labelEl
      )}
      {control}
      {!split && descriptionEl}
      {field.invalid && (
        <span id={field.errorId} className="cy-field-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
  const props = {
    className: `cy-field${className ? ` ${className}` : ""}`,
    "data-size": size,
    "data-layout": split ? "split" : undefined,
    style,
  };
  return group ? (
    <fieldset {...props} aria-labelledby={field.labelId} aria-describedby={field.describedBy}>
      {body}
    </fieldset>
  ) : (
    <div {...props}>{body}</div>
  );
}
