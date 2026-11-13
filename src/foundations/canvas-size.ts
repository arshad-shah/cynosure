import { type RefObject, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

/** An element's size in CSS pixels and the screen's density (device pixels per CSS pixel). */
export interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

/**
 * The size of the element in `ref` (its client box, in CSS pixels) and the screen's `devicePixelRatio`, measured on
 * mount, whenever the element resizes and whenever the density changes (the window moves to another screen, the
 * browser zooms), so a canvas sized `width * dpr` by `height * dpr` stays sharp. Before the first measure (and on the
 * server) it is 0 by 0 at density 1. PanZoomCanvas and SignaturePad use it.
 */
export function useCanvasSize(ref: RefObject<HTMLElement | null>): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, dpr: 1 });
  useClientLayoutEffect(() => {
    const el = ref.current as HTMLElement;
    // The density is read with the size, and watched for a change from the value just read.
    let density: MediaQueryList | undefined;
    const measure = () => {
      const dpr = devicePixelRatio;
      density?.removeEventListener("change", measure);
      density = matchMedia(`(resolution: ${dpr}dppx)`);
      density.addEventListener("change", measure);
      setSize((s) =>
        s.width === el.clientWidth && s.height === el.clientHeight && s.dpr === dpr
          ? s
          : { width: el.clientWidth, height: el.clientHeight, dpr },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      (density as MediaQueryList).removeEventListener("change", measure);
    };
  }, []);
  return size;
}
