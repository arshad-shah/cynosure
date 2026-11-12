import { forwardRef, useRef } from "react";
import { isComposing } from "../../foundations/keys.js";
import { search } from "../../icons/search.js";
import { TextField, type TextFieldProps } from "../TextField/TextField.js";

export interface SearchFieldProps extends Omit<TextFieldProps, "type" | "iconStart"> {
  /** Called with the current value on Enter (never while an IME composition is active). */
  onSubmit?: (value: string) => void;
}

/** TextField preset for search: search icon, clearable, Enter submits, Escape clears then blurs. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { onSubmit, clearable = true, onKeyDown, ...rest },
  forwarded,
) {
  const local = useRef<HTMLInputElement | null>(null);
  return (
    <TextField
      {...rest}
      ref={(node) => {
        local.current = node;
        if (typeof forwarded === "function") forwarded(node);
        else if (forwarded) forwarded.current = node;
      }}
      type="search"
      iconStart={search}
      clearable={clearable}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        const input = e.currentTarget;
        if (e.key === "Enter" && !isComposing(e)) {
          e.preventDefault();
          onSubmit?.(input.value);
        }
        // Escape while an IME composes belongs to the IME (it cancels the composition), not to the field.
        if (e.key === "Escape" && !isComposing(e)) {
          e.preventDefault();
          if (input.value) {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "");
            input.dispatchEvent(new Event("input", { bubbles: true }));
          } else input.blur();
        }
      }}
    />
  );
});
