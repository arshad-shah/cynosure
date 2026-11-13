import type { RefObject } from "react";
import { useDismiss } from "./dismiss.js";
import { usePopover } from "./floating.js";
import { useAnchoredPosition } from "./use-anchored-position.js";

export interface ListboxLayerOptions {
  /** The field or button the list drops down from. */
  anchor: RefObject<HTMLElement | null>;
  /** The list (a `popover="manual"` element). */
  list: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  /** Cap the width at max(anchor, 20rem) so long labels truncate (Select). Default: only at least the anchor's width. */
  capWidth?: boolean;
}

/**
 * The drop-down list layer of Select, Combobox, TagInput and TextArea's mentions: shown in the top layer, at least as
 * wide as its anchor, placed below it (flipping when there is no room), and closed by Escape or a press outside in
 * layer order.
 */
export function useListboxLayer({ anchor, list, open, onClose, capWidth = false }: ListboxLayerOptions) {
  usePopover(list, open, (el) => {
    const width = anchor.current?.offsetWidth ?? 0;
    el.style.minInlineSize = `${width}px`;
    if (capWidth) el.style.maxInlineSize = `max(${width}px, 20rem)`;
  });
  useAnchoredPosition(anchor, list, open, "bottom", 4, "start");
  useDismiss({ open, onClose, inside: [anchor, list] });
}
