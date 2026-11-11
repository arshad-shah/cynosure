import { useId } from "react";

export interface FieldOptions {
  id?: string | undefined;
  description?: unknown;
  error?: unknown;
}

export interface FieldRender {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  /** Space-separated ids for aria-describedby, or undefined when nothing describes the control. */
  describedBy: string | undefined;
  invalid: boolean;
}

/** Stable ids linking a control to its label, description and error. */
export function useField({ id, description, error }: FieldOptions): FieldRender {
  const generated = useId().replace(/:/g, "");
  const base = id ?? `cy-${generated}`;
  const hasDescription = description !== undefined && description !== null && description !== false;
  const invalid = error !== undefined && error !== null && error !== false && error !== "";
  const ids = [hasDescription ? `${base}-description` : "", invalid ? `${base}-error` : ""].filter(Boolean);
  return {
    id: base,
    labelId: `${base}-label`,
    descriptionId: `${base}-description`,
    errorId: `${base}-error`,
    describedBy: ids.length ? ids.join(" ") : undefined,
    invalid,
  };
}
