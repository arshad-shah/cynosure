/** Key and value pairs as text, and back: one `key: value` per line, `# ` in front of a pair that is switched off. */

export interface KeyValuePair {
  /** Stable and unique: React keys and reordering follow it. */
  id: string;
  key: string;
  value: string;
  /** False when switched off (kept, but not used). Default true. */
  enabled?: boolean;
  /** Masked like a password. */
  secret?: boolean;
}

let made = 0;
/** A fresh pair id. */
export const newPairId = () => `kv-${(++made).toString(36)}`;

/** How a pair is named in labels and announcements: its key, or its position. */
export const pairName = (pair: KeyValuePair, index: number, row: (position: number) => string) =>
  pair.key.trim() || row(index + 1);

const OFF = "# ";

/** One line per pair. Secret values are written in plain text: the text view is something people choose to open. */
export const toBulkText = (pairs: readonly KeyValuePair[]) =>
  pairs.map((p) => `${p.enabled === false ? OFF : ""}${p.key}: ${p.value}`).join("\n");

function parseLine(line: string): Omit<KeyValuePair, "id"> {
  let text = line.trim();
  const enabled = !text.startsWith("#");
  if (!enabled) text = text.slice(1).trim();
  const colon = text.indexOf(":");
  const pair =
    colon === -1
      ? { key: text, value: "" }
      : { key: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim() };
  return enabled ? pair : { ...pair, enabled: false };
}

/**
 * Text back into pairs. Ids are reused by position, so React keys stay put while someone types. A pair whose key is in
 * `secretKeys` is secret (the keys that were secret when the text view opened, so retyping one keeps it masked).
 */
export function fromBulkText(
  text: string,
  previous: readonly KeyValuePair[],
  secretKeys: ReadonlySet<string> = new Set(),
): KeyValuePair[] {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, i) => {
      const parsed = parseLine(line);
      const pair = { id: previous[i]?.id ?? newPairId(), ...parsed };
      return secretKeys.has(parsed.key) ? { ...pair, secret: true } : pair;
    });
}
