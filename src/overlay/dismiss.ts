import { type RefObject, useEffect, useRef } from "react";

export type DismissReason = "escape" | "outside";

export interface DismissOptions {
  open: boolean;
  onClose: (reason: DismissReason) => void;
  /** Elements that count as inside the layer (trigger, floating panel). Pointer downs elsewhere close it. */
  inside: RefObject<HTMLElement | null>[];
  /** Where focus goes after closing, if it was inside the layer or lost (on the body). */
  returnFocus?: RefObject<HTMLElement | null>;
  /**
   * Close on a pointer down outside (default true). A function decides instead (a modal dialog passes "the pointer went
   * down on its backdrop"); then only the topmost layer closes, so a click on a dialog's backdrop with a Menu open inside
   * closes just the Menu.
   */
  outside?: boolean | ((event: PointerEvent) => boolean);
}

interface Layer {
  inside: RefObject<HTMLElement | null>[];
  close: (reason: DismissReason) => void;
  /** Never closes on a pointer down (a Tooltip): it does not stand between a click and the layer under it. */
  passive: () => boolean;
}

const layers: Layer[] = [];

const els = (layer: Layer) => layer.inside.map((r) => r.current).filter((e): e is HTMLElement => !!e);
/** `outer` has `inner` nested in it (inner's elements live inside one of outer's elements). */
const holds = (outer: Layer, inner: Layer) =>
  els(outer).some((o) => els(inner).some((i) => o !== i && o.contains(i)));

/**
 * The layer Escape belongs to: the most recently opened one that has no other open layer nested inside it. For pointer
 * downs, layers that ignore them (`passive`) are left out.
 */
function topmost(pointer = false): Layer | undefined {
  const open = pointer ? layers.filter((l) => !l.passive()) : layers;
  for (let i = open.length - 1; i >= 0; i--) {
    const layer = open[i] as Layer;
    if (!open.some((other) => other !== layer && holds(layer, other))) return layer;
  }
  return undefined;
}

function onKeyDown(event: KeyboardEvent) {
  // Components that handle Escape themselves (an open Select list) prevent default; leave those alone.
  if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
  const top = topmost();
  if (!top) return;
  event.preventDefault();
  top.close("escape");
}

/**
 * Shared dismissal for overlays (Popover, Menu, Dialog, Tooltip): Escape closes only the topmost open layer, a pointer
 * down outside closes the layer, and focus returns to the trigger. Works across shadow roots (composedPath).
 */
export function useDismiss({ open, onClose, inside, returnFocus, outside = true }: DismissOptions) {
  const close = useRef(onClose);
  close.current = onClose;
  const insideRef = useRef(inside);
  insideRef.current = inside;
  const outsideRef = useRef(outside);
  outsideRef.current = outside;

  useEffect(() => {
    if (!open) return;
    const layer: Layer = {
      inside: insideRef.current,
      close: (reason) => close.current(reason),
      passive: () => outsideRef.current === false,
    };
    layers.push(layer);
    if (layers.length === 1) document.addEventListener("keydown", onKeyDown);
    // Registered when the layer opens, so an outer layer hears a pointer down before the layers nested in it.
    const onPointerDown = (event: PointerEvent) => {
      const rule = outsideRef.current;
      if (typeof rule === "function") {
        if (rule(event) && topmost(true) === layer) layer.close("outside");
        return;
      }
      if (!rule) return;
      const path = event.composedPath();
      if (els(layer).some((el) => path.includes(el))) return;
      layer.close("outside");
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    const target = returnFocus;
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      const at = layers.indexOf(layer);
      if (at >= 0) layers.splice(at, 1);
      if (layers.length === 0) document.removeEventListener("keydown", onKeyDown);
      // Return focus only if it was inside the layer or got lost; never pull it from somewhere the user chose.
      const active = document.activeElement;
      const lost = !active || active === document.body;
      const within = !!active && els(layer).some((el) => el !== target?.current && el.contains(active));
      const back = target?.current;
      if ((lost || within) && back?.isConnected) back.focus();
    };
  }, [open, returnFocus]);
}
