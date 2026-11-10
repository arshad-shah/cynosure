import { DialogFrame, type DialogProps } from "../Dialog/Dialog.js";

export interface SheetTokens {
  radius: string;
  widthSm: string;
  widthMd: string;
  widthLg: string;
  maxHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    sheet: SheetTokens;
  }
}

export interface SheetProps extends DialogProps {
  /**
   * Edge it docks to: the bottom (full width), the inline end (full height; left in right-to-left text) or the inline
   * start (full height; a navigation drawer; right in right-to-left text).
   */
  side?: "bottom" | "end" | "start";
}

/** A Dialog docked to an edge: same focus, Escape, backdrop and labels behaviour, sliding in from its side. */
export function Sheet({ side = "bottom", ...props }: SheetProps) {
  return <DialogFrame {...props} side={side} />;
}
