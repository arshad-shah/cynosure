import { forwardRef, type InputHTMLAttributes } from "react";

export interface FileInputBaseProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> {
  /** Called with the files picked (an empty array when the picker is cleared). */
  onFiles?: (files: File[]) => void;
}

/** Foundation: the only place Cynosure renders a native `<input type="file">`. Composites style or hide it. */
export const FileInputBase = forwardRef<HTMLInputElement, FileInputBaseProps>(function FileInputBase(
  { onFiles, ...rest },
  ref,
) {
  return (
    <input ref={ref} type="file" {...rest} onChange={(e) => onFiles?.([...(e.currentTarget.files ?? [])])} />
  );
});

/** Puts `files` into a file input, so a form submits them (e.g. files that were dropped rather than picked). */
export function setInputFiles(input: HTMLInputElement, files: readonly File[]) {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}
