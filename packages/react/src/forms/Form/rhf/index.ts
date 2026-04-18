/**
 * `react-hook-form` integration entry point for `@arshad-shah/cynosure-react`.
 *
 * This module only imports `react-hook-form` types (erased at runtime) and
 * reaches for the runtime via a lazy `require` / dynamic import inside the
 * `RHFField` body. Consumers who don't install `react-hook-form` pay zero
 * runtime cost — the import chain is completely dead code.
 *
 * Subpath: `@arshad-shah/cynosure-react/rhf`.
 */
export { RHFField } from './RHFField.js';
export type { RHFFieldProps } from './RHFField.js';
