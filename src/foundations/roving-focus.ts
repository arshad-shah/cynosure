import { type RefObject, useEffect } from "react";

export interface RovingOptions {
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  /** Items are elements inside the container matching this selector. */
  selector?: string;
}

const enabled = (el: HTMLElement) =>
  el.getAttribute("aria-disabled") !== "true" && !(el as HTMLButtonElement).disabled;

/**
 * Roving tabindex (WAI-ARIA APG): one tab stop; arrows move focus between items, skipping disabled ones;
 * Home and End jump; horizontal arrows follow the reading direction (RTL aware).
 */
export function useRovingFocus(container: RefObject<HTMLElement | null>, options: RovingOptions = {}) {
  const { orientation = "horizontal", loop = true, selector = "[data-roving]" } = options;
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const items = () => [...root.querySelectorAll<HTMLElement>(selector)];
    const setStop = (target: HTMLElement) => {
      for (const item of items()) item.tabIndex = item === target ? 0 : -1;
    };
    const initial =
      items().find(
        (el) => el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-checked") === "true",
      ) ?? items().find(enabled);
    if (initial) setStop(initial);

    const onFocusIn = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (item && root.contains(item)) setStop(item);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const list = items().filter(enabled);
      const current = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (!current || !list.length) return;
      const rtl = getComputedStyle(root).direction === "rtl";
      const horizontal = orientation !== "vertical";
      const vertical = orientation !== "horizontal";
      const forward =
        (horizontal && e.key === (rtl ? "ArrowLeft" : "ArrowRight")) || (vertical && e.key === "ArrowDown");
      const backward =
        (horizontal && e.key === (rtl ? "ArrowRight" : "ArrowLeft")) || (vertical && e.key === "ArrowUp");
      let index = list.indexOf(current);
      if (forward) index = index + 1 >= list.length ? (loop ? 0 : index) : index + 1;
      else if (backward) index = index - 1 < 0 ? (loop ? list.length - 1 : index) : index - 1;
      else if (e.key === "Home") index = 0;
      else if (e.key === "End") index = list.length - 1;
      else return;
      e.preventDefault();
      const next = list[index] as HTMLElement;
      setStop(next);
      next.focus();
    };
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [container, orientation, loop, selector]);
}
