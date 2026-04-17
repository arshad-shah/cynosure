export const AVATAR_PALETTE = [
  'red',
  'amber',
  'green',
  'blue',
  'violet',
  'pink',
  'teal',
  'orange',
] as const;

export type AvatarPaletteKey = (typeof AVATAR_PALETTE)[number];

/**
 * Deterministically derives a palette entry from a display name. Same input ⇒
 * same output forever, so an avatar's colour doesn't flicker between renders.
 */
export const colorFromName = (name: string): AvatarPaletteKey => {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index] ?? AVATAR_PALETTE[0];
};

/**
 * Best-effort initials extractor: first letter of the first two whitespace-
 * separated tokens, uppercased. Falls back to the first two characters of the
 * trimmed input if there's no whitespace.
 */
export const initialsFromName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/u);
  const first = parts[0] ?? '';
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const last = parts[parts.length - 1] ?? '';
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
};
