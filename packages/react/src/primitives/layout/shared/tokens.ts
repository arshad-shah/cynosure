import type { vars } from '../../../styles/vars.css.js';

/**
 * Token-shaped string literals accepted by the layout primitives and the
 * resolvers that turn them into raw CSS values (typically `var(--cynosure-...)`).
 */

export type SpaceToken = keyof typeof vars.space;
export type RadiusToken = keyof typeof vars.radius;
export type ShadowToken = keyof typeof vars.shadow;
export type DurationToken = keyof typeof vars.duration;
export type ZIndexToken = keyof typeof vars.z;

type BgKey = keyof typeof vars.color.background;
type FgKey = keyof typeof vars.color.foreground;
type BorderKey = keyof typeof vars.color.border;
type AccentKey = keyof typeof vars.color.accent;
type FeedbackKey = keyof typeof vars.color.feedback;
type FeedbackSlot = keyof (typeof vars.color.feedback)['success'];

/**
 * `<category>.<name>` form:
 *   - `bg.surface`, `bg.canvas`, …
 *   - `fg.default`, `fg.muted`, …
 *   - `border.default`, `border.focus`, …
 *   - `accent.solid`, `accent.soft`, …
 *   - `feedback.success.solid`, `feedback.danger.border`, …
 */
export type ColorToken =
  | `bg.${BgKey}`
  | `fg.${FgKey}`
  | `border.${BorderKey}`
  | `accent.${AccentKey}`
  | `feedback.${FeedbackKey}.${FeedbackSlot}`;

/** Literal pixel value like `"200px"`. */
export type PxValue = `${number}px`;
/** Literal percentage value like `"50%"`. */
export type PercentValue = `${number}%`;
/** Literal rem value like `"2rem"`. */
export type RemValue = `${number}rem`;
/** Literal ch value like `"65ch"`. */
export type ChValue = `${number}ch`;

export type LengthValue = PxValue | PercentValue | RemValue | ChValue;

export type SizeValue = SpaceToken | 'full' | 'auto' | 'fit' | 'screen' | 'prose' | LengthValue;

const isColorToken = (v: string): v is ColorToken =>
  v.startsWith('bg.') ||
  v.startsWith('fg.') ||
  v.startsWith('border.') ||
  v.startsWith('accent.') ||
  v.startsWith('feedback.');

const hasDot = (v: string): boolean => /[.]/.test(v);

const spaceVarName = (token: SpaceToken): string =>
  `--cynosure-space-${String(token).replace(/\./g, '-')}`;

/** `"4"` → `var(--cynosure-space-4)`; `"0.5"` → `var(--cynosure-space-0-5)`. */
export const resolveSpace = (value: SpaceToken | 'auto'): string => {
  if (value === 'auto') return 'auto';
  return `var(${spaceVarName(value)})`;
};

/** `"md"` → `var(--cynosure-radius-md)`. */
export const resolveRadius = (value: RadiusToken): string =>
  `var(--cynosure-radius-${String(value)})`;

/** `"md"` → `var(--cynosure-shadow-md)`; `"focusRing"` → `var(--cynosure-shadow-focus-ring)`. */
export const resolveShadow = (value: ShadowToken): string => {
  const seg = String(value)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return `var(--cynosure-shadow-${seg})`;
};

/** `"modal"` → `var(--cynosure-z-modal)`. */
export const resolveZIndex = (value: ZIndexToken): string => `var(--cynosure-z-${String(value)})`;

/** `"bg.surface"` → `var(--cynosure-color-background-surface)`. */
export const resolveColor = (value: ColorToken): string => {
  const [head, ...rest] = value.split('.');
  const mapHead: Record<string, string> = {
    bg: 'background',
    fg: 'foreground',
    border: 'border',
    accent: 'accent',
    feedback: 'feedback',
  };
  const category = mapHead[head as string] ?? (head as string);
  const tail = rest.map((seg) => seg.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()).join('-');
  return `var(--cynosure-color-${category}-${tail})`;
};

const SIZE_ALIASES: Record<string, string> = {
  full: '100%',
  auto: 'auto',
  fit: 'fit-content',
  screen: '100vh',
  prose: '65ch',
};

/**
 * Resolve a generic size token:
 *  - Aliases: `full → 100%`, `auto → auto`, `fit → fit-content`,
 *    `screen → 100vh`, `prose → 65ch`.
 *  - Raw lengths (`"200px"`, `"50%"`, `"2rem"`, `"65ch"`) pass through.
 *  - Anything else is treated as a space token and resolved via `resolveSpace`.
 */
export const resolveSize = (value: SizeValue): string => {
  const str = String(value);
  if (str in SIZE_ALIASES) return SIZE_ALIASES[str] as string;
  if (/^-?\d+(\.\d+)?(px|%|rem|ch|em|vh|vw)$/.test(str)) return str;
  return resolveSpace(str as SpaceToken);
};

/**
 * Same as `resolveSize`, but also allows `"auto"` (useful for margin).
 */
export const resolveSpaceOrAuto = (value: SpaceToken | 'auto'): string => resolveSpace(value);

export { isColorToken, hasDot };
