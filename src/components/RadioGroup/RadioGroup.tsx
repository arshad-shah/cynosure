import { type CSSProperties, type KeyboardEvent, type ReactNode, useId } from "react";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { Choice } from "../Choice/Choice.js";
import { Field } from "../Field/Field.js";

export interface RadioGroupTokens {
  /** Space between the options. */
  gap: string;
  /** Narrowest a card may be before the grid wraps to fewer columns (`variant="card"`). Default 8rem. */
  cardMinWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    radioGroup: RadioGroupTokens;
  }
}

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** The option's picture, shown above its label in a card (`variant="card"`). The label still names the option. */
  media?: ReactNode;
}

export interface RadioGroupProps {
  /** Names the group, shown above the options. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the options. */
  description?: ReactNode;
  /** Error message shown below the options and announced. */
  error?: ReactNode;
  /** The choices: `{ value, label, description?, disabled? }`. */
  options: RadioOption[];
  /** Native group name (generated when omitted). */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Selected value at first, when uncontrolled. */
  defaultValue?: string | undefined;
  /** Called with the option's value when it is chosen. */
  onChange?: (value: string) => void;
  /** Stack the options, or lay them in a row that wraps. Default "vertical". Not used by cards. */
  orientation?: "vertical" | "horizontal";
  /**
   * `"card"`: each option is a card in a grid, with its `media` above the label, for choosing by picture (a signature
   * style, a theme, a layout). Default `"list"`: a radio and its label per row.
   */
  variant?: "list" | "card";
  /** Cards per row (`variant="card"`). A narrow container wraps to fewer, never below `--cy-radio-group-card-min-width`. Default 2. */
  columns?: number;
  /** The form will not submit until an option is chosen; also draws the required marker. */
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Size of the radios and their text. Default "md". */
  size?: Size;
  /** Colour of the chosen radio. Default "accent". */
  tone?: Tone;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/**
 * Up and Down in a grid of cards move a row (by the columns shown, which a narrow container lowers) and stay put at the
 * edges or on a disabled card. Left and Right stay native: they wrap and skip disabled radios.
 */
function moveByRow(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const radios = [...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const from = radios.indexOf(event.target as HTMLInputElement);
  if (from < 0) return;
  event.preventDefault();
  const card = (r: HTMLInputElement) => r.closest(".cy-choice")?.getBoundingClientRect().top ?? 0;
  const firstRow = card(radios[0] as HTMLInputElement);
  const shown = Math.max(1, radios.filter((r) => Math.abs(card(r) - firstRow) < 1).length);
  const target = radios[from + (event.key === "ArrowDown" ? shown : -shown)];
  if (!target || target.disabled) return;
  target.focus();
  target.click();
}

/**
 * One choice from a list, on native radios: arrows, wrap, disabled skipping, RTL, forms and reset are native. With
 * `variant="card"`, a grid of picture cards.
 */
export function RadioGroup({
  label,
  labelHidden,
  description,
  error,
  options,
  name,
  value,
  defaultValue,
  onChange,
  orientation = "vertical",
  variant = "list",
  columns = 2,
  required,
  disabled,
  size = "md",
  tone = "accent",
  className,
  style,
}: RadioGroupProps) {
  const generated = useId();
  const groupName = name ?? `cy-radio-${generated}`;
  return (
    <Field
      group
      label={label}
      labelHidden={labelHidden}
      description={description}
      error={error}
      required={required}
      size={size}
      className={className}
      style={style}
    >
      {() => (
        // biome-ignore lint/a11y/noStaticElementInteractions: delegated arrow keys for the native radios inside
        <div
          className="cy-radio-group"
          data-orientation={variant === "card" ? undefined : orientation}
          data-variant={variant === "card" ? "card" : undefined}
          style={
            variant === "card"
              ? ({ "--_cols": Math.max(1, Math.floor(columns)) } as CSSProperties)
              : undefined
          }
          onKeyDown={variant === "card" ? moveByRow : undefined}
        >
          {options.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              description={option.description}
              name={groupName}
              value={option.value}
              required={required}
              disabled={disabled || option.disabled}
              size={size}
              {...(variant === "card" ? { variant: "card" as const, media: option.media } : {})}
              {...(value !== undefined
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={(checked) => checked && onChange?.(option.value)}
              control={(input) =>
                variant === "card" ? (
                  // The card shows the state; the native radio stays for forms, keys and assistive tech.
                  <span className="cy-visually-hidden">
                    <ChoiceBase {...input} type="radio" />
                  </span>
                ) : (
                  <span className="cy-radio-group-radio" data-size={size} data-tone={tone}>
                    <ChoiceBase {...input} type="radio" />
                  </span>
                )
              }
            />
          ))}
        </div>
      )}
    </Field>
  );
}
