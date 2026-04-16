import { type RefObject, useEffect } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

/**
 * Thin wrapper around `MutationObserver`. Pass an element ref and the
 * observer options; the callback fires for every mutation batch. Callback
 * identity is stabilised automatically.
 */
export function useMutationObserver<T extends Node>(
  ref: RefObject<T | null>,
  callback: MutationCallback,
  options: MutationObserverInit = { attributes: true, childList: true, subtree: true },
): void {
  const stable = useCallbackRef(callback);

  const {
    attributes,
    childList,
    subtree,
    attributeFilter,
    characterData,
    attributeOldValue,
    characterDataOldValue,
  } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations, inst) => stable(mutations, inst));
    observer.observe(node, {
      attributes,
      childList,
      subtree,
      attributeFilter,
      characterData,
      attributeOldValue,
      characterDataOldValue,
    });
    return () => observer.disconnect();
  }, [
    ref,
    stable,
    attributes,
    childList,
    subtree,
    attributeFilter,
    characterData,
    attributeOldValue,
    characterDataOldValue,
  ]);
}
