import { type CSSProperties, forwardRef, type ReactNode, useState } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import type { IconData } from "../../icons/types.js";
import type { DenseSize } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import type { FieldLayoutProps } from "../Field/Field.js";
import { TextField } from "../TextField/TextField.js";

export interface PathFieldTokens {
  /** Space between the Browse button and the end of the field. */
  browseInset: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    pathField: PathFieldTokens;
  }
}

export interface PathFieldLabels {
  /** The button that opens the picker. Default: "Browse…". */
  browse: string;
  /** The clear button. Default: "Clear". */
  clear: string;
}

export interface PathFieldProps extends FieldLayoutProps {
  /** The field's label and accessible name. */
  label: ReactNode;
  /** Visually hide the label (it still names the field). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field and read with it. */
  description?: ReactNode;
  /** Your own error message, shown below the field. */
  error?: ReactNode;
  /** The path (controlled). */
  value?: string | undefined;
  /** The path at first, when uncontrolled. */
  defaultValue?: string | undefined;
  /** Called with the new path when it is typed, picked or cleared. */
  onChange?: ((value: string) => void) | undefined;
  /**
   * Opens your picker (Electron's `dialog.showOpenDialog` over IPC, a file system access handle) and resolves with the
   * chosen path, or null when it was cancelled. The button is busy until it settles; a cancel or a failure (the
   * promise rejects) leaves the path as it was.
   */
  onPick: () => Promise<string | null>;
  /** Name the path is submitted under in a form. */
  name?: string | undefined;
  /** Id of the form it belongs to, when it is not inside that form. */
  form?: string | undefined;
  /** The form cannot be submitted while the path is empty. */
  required?: boolean | undefined;
  /** Turns off the field and its buttons; the path is not submitted. */
  disabled?: boolean | undefined;
  /** Hint shown in the field while it is empty. */
  placeholder?: string | undefined;
  /** Icon at the start of the field. */
  iconStart?: IconData | undefined;
  /** Field height and text size. Default "md". */
  size?: DenseSize;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /** Replace the built-in English text: the Browse and clear buttons. */
  labels?: Partial<PathFieldLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-path-field-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: PathFieldLabels = { browse: "Browse…", clear: "Clear" };

/** The Browse button one step smaller than the field, so it sits inside it. */
const BUTTON_SIZE = { xs: "xs", sm: "xs", md: "sm", lg: "md" } as const;

/**
 * A file or folder path: a text field with a Browse button that asks your picker for a path, and a clear button.
 * The path can also be typed. For an app with its own file dialog (Electron), where a browser file input has no path.
 */
export const PathField = forwardRef<HTMLInputElement, PathFieldProps>(function PathField(
  {
    label,
    labelHidden,
    layout,
    width,
    description,
    error,
    value,
    defaultValue = "",
    onChange,
    onPick,
    name,
    form,
    required,
    disabled,
    placeholder,
    iconStart,
    size = "md",
    variant = "outline",
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [path, setPath] = useControllableState(value, defaultValue, onChange);
  const [picking, setPicking] = useState(false);

  const pick = () => {
    setPicking(true);
    // A picker that fails changes nothing: the button stops being busy and the path stays.
    onPick()
      .then(
        (chosen) => {
          if (chosen !== null) setPath(chosen);
        },
        () => {},
      )
      .finally(() => setPicking(false));
  };

  return (
    <div className={className ? `cy-path-field ${className}` : "cy-path-field"} style={style}>
      <TextField
        ref={ref}
        label={label}
        labelHidden={labelHidden}
        layout={layout}
        width={width}
        description={description}
        error={error}
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        iconStart={iconStart}
        size={size}
        variant={variant}
        autoComplete="off"
        spellCheck={false}
        value={path}
        onChange={setPath}
        clearable={!disabled}
        labels={{ clear: text.clear }}
        addonEnd={
          <Button
            className="cy-path-field-browse"
            variant="soft"
            tone="neutral"
            size={BUTTON_SIZE[size]}
            disabled={disabled}
            loading={picking}
            onClick={pick}
          >
            {text.browse}
          </Button>
        }
      />
    </div>
  );
});
