import { type RefObject, useEffect } from "react";
import { isRtl } from "./dir.js";

export interface RovingOptions {
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  /** Items are elements inside the container matching this selector. */
  selector?: string;
}

const enabled = (el: HTMLElement) =>
  el.getAttribute("aria-disabled") !== "true" && !(el as HTMLButtonElement).disabled;

const TEXT_INPUT = /^(?:text|search|email|url|tel|password|number|date|time|datetime-local|month|week)$/;
/** Text entry keeps its own caret keys (arrows, Home, End). */
const ownsArrowKeys = (el: HTMLElement) =>
  el instanceof HTMLTextAreaElement ||
  el.isContentEditable ||
  (el instanceof HTMLInputElement && TEXT_INPUT.test(el.type));

/**
 * Roving tabindex (WAI-ARIA APG): one tab stop; arrows move focus between items, skipping disabled ones;
 * Home and End jump; horizontal arrows follow the reading direction (RTL aware).
 */
export function useRovingFocus(container: RefObject<HTMLElement | null>, options: RovingOptions = {}) {
  const { orientation = "horizontal", loop = true, selector = "[data-roving]" } = options;
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    // Items inside a popover nested in the group (a Menu's panel rendered in place) belong to that popover.
    const own = (el: HTMLElement) => {
      for (let n = el.parentElement; n && n !== root; n = n.parentElement)
        if (n.hasAttribute("popover")) return false;
      return true;
    };
    const items = () => [...root.querySelectorAll<HTMLElement>(selector)].filter(own);
    const setStop = (target: HTMLElement) => {
      for (const item of items()) item.tabIndex = item === target ? 0 : -1;
    };
    const selected = () =>
      items().find(
        (el) =>
          enabled(el) &&
          (el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-checked") === "true"),
      );
    let stop: HTMLElement | undefined = selected() ?? items().find(enabled);
    const sync = () => {
      // While focus is elsewhere the stop follows the selection (APG tabs, radios); otherwise keep the current stop
      // if it is still here, falling back to the first enabled item.
      if (!root.contains(document.activeElement)) stop = selected() ?? stop;
      if (!stop || !root.contains(stop) || !enabled(stop)) stop = items().find(enabled);
      if (stop) setStop(stop);
    };
    sync();
    // Items added, removed or disabled later join (or leave) the roving group.
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "aria-disabled", "aria-selected", "aria-checked"],
    });

    const onFocusIn = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (item && root.contains(item)) {
        stop = item;
        setStop(item);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const list = items().filter(enabled);
      const current = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (!current || !list.length || e.defaultPrevented || ownsArrowKeys(current)) return;
      const rtl = isRtl(root);
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
      stop = next;
      setStop(next);
      next.focus();
    };
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [container, orientation, loop, selector]);
}
