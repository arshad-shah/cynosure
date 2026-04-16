/**
 * Returns a function that calls every passed-in function with the same
 * arguments in order. Useful as an event-handler combiner when
 * `composeEventHandlers`' default-prevented short-circuit isn't desired.
 */
export function callAll<Args extends unknown[]>(
  ...fns: Array<((...args: Args) => void) | undefined | null>
): (...args: Args) => void {
  return (...args: Args) => {
    for (const fn of fns) fn?.(...args);
  };
}
