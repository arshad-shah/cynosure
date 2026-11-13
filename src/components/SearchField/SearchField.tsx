import { forwardRef, type ReactNode, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { isComposing } from "../../foundations/keys.js";
import { mergeRefs } from "../../foundations/refs.js";
import { search } from "../../icons/search.js";
import { TextField, type TextFieldProps } from "../TextField/TextField.js";

export interface SearchFieldTokens {
  /** Colour of the trailing status text. */
  trailingColor: string;
  /** Font size of the trailing status text (a match count). */
  trailingFontSize: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    searchField: SearchFieldTokens;
  }
}

export interface SearchFieldProps extends Omit<TextFieldProps, "type" | "iconStart"> {
  /** Called with the current value on Enter (never while an IME composition is active). */
  onSubmit?: (value: string) => void;
  /**
   * Status text inside the field, at its end: a match count such as "3 of 12". When its text changes it is announced
   * politely. Text only: put controls in `addonEnd`.
   */
  trailing?: ReactNode;
}

/** TextField preset for search: search icon, clearable, Enter submits, Escape clears then blurs. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { onSubmit, clearable = true, onKeyDown, trailing, addonEnd, ...rest },
  forwarded,
) {
  const local = useRef<HTMLInputElement | null>(null);
  // The visible text is hidden from assistive technology; a live region always in the page reads it once per change.
  const shown = useRef<HTMLSpanElement>(null);
  const [said, setSaid] = useState("");
  useClientLayoutEffect(() => {
    const text = shown.current?.textContent ?? "";
    if (text !== said) setSaid(text);
  });
  return (
    <TextField
      {...rest}
      ref={mergeRefs(local, forwarded)}
      type="search"
      iconStart={search}
      clearable={clearable}
      addonEnd={
        <>
          {(Boolean(trailing) || trailing === 0) && (
            <span ref={shown} className="cy-search-field-trailing" aria-hidden="true">
              {trailing}
            </span>
          )}
          <span className="cy-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            {said}
          </span>
          {addonEnd}
        </>
      }
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
