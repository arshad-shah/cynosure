/**
 * Re-export Radix's `Slot`/`Slottable` as Cynosure's composition primitive.
 *
 * We intentionally depend on `@radix-ui/react-slot` rather than reimplementing:
 * it's ~600 bytes gzipped and handles several subtle cases (Fragment
 * detection, Slottable merging, event-handler composition, ref forwarding)
 * that aren't worth re-deriving. See `04-core-utilities.md` for the rationale.
 */
export { Slot, Slottable } from '@radix-ui/react-slot';
export type { SlotProps } from '@radix-ui/react-slot';
