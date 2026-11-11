/** `items` with the ones keyed `keys` taken out and put back together, the first of them at `to`. */
export function moveItems<T>(
  items: readonly T[],
  keys: readonly string[],
  to: number,
  getKey: (item: T, index: number) => string,
): T[] {
  const moving = new Set(keys);
  const block = items.filter((item, i) => moving.has(getKey(item, i)));
  const rest = items.filter((item, i) => !moving.has(getKey(item, i)));
  return [...rest.slice(0, to), ...block, ...rest.slice(to)];
}
