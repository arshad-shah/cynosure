import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { focusRing } from '../../styles/focusRing.js';
import { vars } from '../../styles/vars.css.js';

/**
 * New Textarea has its own wrapper (block flex column) instead of reusing
 * `controlWrapperBase`, because it owns a footer row and corner grip.
 * The "punched-card" language is kept — subtle well, inset shadow, focus
 * lifts to surface — via the same token palette.
 */
export const textareaRoot = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  background: vars.color.background.subtle,
  color: vars.color.foreground.default,
  border: `1px solid ${vars.color.border.default}`,
  boxShadow: `inset 0 1px 0 color-mix(in oklab, ${vars.color.foreground.default} 4%, transparent)`,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  overflow: 'hidden',
  selectors: {
    '&[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"])': {
      borderColor: vars.color.border.strong,
    },
    '&[data-focus-within="true"]:not([data-invalid="true"])': {
      background: vars.color.background.surface,
      borderColor: vars.color.border.focus,
      boxShadow: focusRing,
    },
    '&[data-invalid="true"]': {
      borderColor: vars.color.feedback.danger.border,
    },
    '&[data-invalid="true"][data-focus-within="true"]': {
      background: vars.color.background.surface,
      boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
    },
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
      borderColor: vars.color.border.disabled,
    },
    '&[data-readonly="true"]': {
      background: vars.color.background.muted,
    },
  },
});

export const textareaRootVariant = styleVariants({
  outline: {},
  filled: {
    background: vars.color.background.muted,
    borderColor: 'transparent',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"])': {
        borderColor: vars.color.border.strong,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.surface,
      },
    },
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    selectors: {
      '&[data-hover="true"]:not([data-disabled="true"])': {
        background: vars.color.background.subtle,
      },
      '&[data-focus-within="true"]': {
        background: vars.color.background.surface,
        boxShadow: focusRing,
      },
    },
  },
});

/**
 * Per-size radius + font. The grip insets are paired to the radius so
 * the outermost grip stroke runs tangent to the corner curve.
 */
/**
 * Per-size radius + font. Grip-slot reservation happens on field/footer
 * (not here) so the root doesn't gain empty chrome.
 */
export const textareaRootSize = styleVariants({
  sm: {
    borderRadius: vars.radius.sm,
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  },
  md: {
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
  },
  lg: {
    borderRadius: vars.radius.lg,
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
  },
});

/**
 * The raw `<textarea>`. Always `resize: none` — we own resize via the grip.
 * `data-clearable="true"` reserves right-padding for the clear button so
 * text never runs underneath it.
 */
export const textareaField = style({
  display: 'block',
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  resize: 'none',
  minHeight: '3.5rem',
  boxSizing: 'border-box',
  // Firefox: thin (~10px) track with themed thumb.
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.color.border.strong} transparent`,
  // Reserve the scrollbar's lane whether or not it's visible, so text
  // position doesn't shift when content spills over.
  scrollbarGutter: 'stable',
  selectors: {
    '&::placeholder': { color: vars.color.foreground.subtle },
    '&:disabled': { cursor: 'not-allowed' },
  },
});

// WebKit scrollbar (Chromium, Safari). 6px track keeps the clear button clear
// of the scrollbar lane even at small sizes. `globalStyle` is used because
// `::-webkit-scrollbar` pseudo-elements aren't in vanilla-extract's type map.
globalStyle(`${textareaField}::-webkit-scrollbar`, {
  width: '6px',
  height: '6px',
});
globalStyle(`${textareaField}::-webkit-scrollbar-track`, {
  background: 'transparent',
});
globalStyle(`${textareaField}::-webkit-scrollbar-thumb`, {
  background: vars.color.border.strong,
  borderRadius: '3px',
});
globalStyle(`${textareaField}::-webkit-scrollbar-thumb:hover`, {
  background: vars.color.foreground.muted,
});
globalStyle(`${textareaField}::-webkit-scrollbar-corner`, {
  background: 'transparent',
});

export const textareaFieldSize = styleVariants({
  // clearable padding-right is tuned so text ends ~2px left of the clear
  // button — the tightest gap that still looks deliberate.
  // Formula: inset + button-width + 2px.
  //
  // When a grip is present and there's no footer to absorb its slot, the
  // field itself takes on extra padding-bottom so text never runs under the
  // grip — matches the ClearButton pattern for the right edge.
  sm: {
    padding: '0.5rem 0.625rem',
    // 8 + 20 + 2 = 30px
    selectors: {
      '&[data-clearable="true"]': { paddingInlineEnd: '1.875rem' },
      [`${textareaRoot}[data-has-grip="true"]:not([data-has-footer="true"]) &`]: {
        // grip 10 + inset 3 + 3 gap = 16px
        paddingBottom: '1rem',
      },
    },
  },
  md: {
    padding: '0.6875rem 0.875rem',
    // 10 + 24 + 2 = 36px
    selectors: {
      '&[data-clearable="true"]': { paddingInlineEnd: '2.25rem' },
      [`${textareaRoot}[data-has-grip="true"]:not([data-has-footer="true"]) &`]: {
        // grip 12 + inset 4 + 4 gap = 20px
        paddingBottom: '1.25rem',
      },
    },
  },
  lg: {
    padding: '0.875rem 1rem',
    // 12 + 28 + 2 = 42px
    selectors: {
      '&[data-clearable="true"]': { paddingInlineEnd: '2.625rem' },
      [`${textareaRoot}[data-has-grip="true"]:not([data-has-footer="true"]) &`]: {
        // grip 14 + inset 5 + 5 gap = 24px
        paddingBottom: '1.5rem',
      },
    },
  },
});

/**
 * `field-sizing: content` is Chromium-only; csstype doesn't know it, hence
 * the explicit cast. The JS fallback in `TextareaField` handles Safari/Firefox.
 */
export const textareaAutoResize = style({
  fieldSizing: 'content',
});

/* ---------- Clear button (top-right corner) ---------- */

export const clearButton = style({
  position: 'absolute',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  padding: 0,
  background: vars.color.background.muted,
  color: vars.color.foreground.muted,
  cursor: 'pointer',
  transition: `opacity ${vars.duration.fast} ${vars.easing.linear}, background-color ${vars.duration.fast}, color ${vars.duration.fast}`,
  selectors: {
    '&:hover': {
      background: vars.color.background.subtle,
      color: vars.color.foreground.default,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent.ring}`,
      outlineOffset: '1px',
    },
    // Red tint when the card is invalid (e.g. over-limit)
    [`${textareaRoot}[data-invalid="true"] &`]: {
      background: vars.color.feedback.danger.soft,
      color: vars.color.feedback.danger.foreground,
    },
  },
});

export const clearButtonSize = styleVariants({
  sm: {
    top: '0.5rem',
    right: '0.5rem',
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: vars.radius.sm,
  },
  md: {
    top: '0.625rem',
    right: '0.625rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: vars.radius.sm,
  },
  lg: {
    top: '0.75rem',
    right: '0.75rem',
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: vars.radius.md,
  },
});

export const clearButtonHidden = style({
  opacity: 0,
  pointerEvents: 'none',
});

/* ---------- Footer (inside the card) ---------- */

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[2],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  minHeight: '2rem',
});

/**
 * When a grip is visible AND a footer exists, the footer reserves right
 * padding so the grip (absolutely positioned at the root's bottom-right)
 * sits in the footer's empty corner instead of on top of whatever the
 * consumer put there. Padding-right = grip-width + inset + small gap.
 */
export const footerSize = styleVariants({
  sm: {
    padding: `${vars.space[1]} ${vars.space[2]}`,
    selectors: {
      [`${textareaRoot}[data-has-grip="true"] &`]: {
        // grip 10 + inset 3 + 3 gap = 16px
        paddingInlineEnd: '1rem',
      },
    },
  },
  md: {
    padding: `${vars.space[1]} ${vars.space[3]}`,
    selectors: {
      [`${textareaRoot}[data-has-grip="true"] &`]: {
        // grip 12 + inset 4 + 4 gap = 20px
        paddingInlineEnd: '1.25rem',
      },
    },
  },
  lg: {
    padding: `${vars.space[2]} ${vars.space[4]}`,
    selectors: {
      [`${textareaRoot}[data-has-grip="true"] &`]: {
        // grip 14 + inset 5 + 5 gap = 24px
        paddingInlineEnd: '1.5rem',
      },
    },
  },
});

export const actions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
});

/* ---------- Counter badge ---------- */

export const counter = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
  padding: '0.125rem 0.5rem',
  background: vars.color.background.surface,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  fontSize: '0.6875rem',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.foreground.muted,
  selectors: {
    '&[data-state="warning"]': {
      color: vars.color.feedback.warning.foreground,
      borderColor: vars.color.feedback.warning.border,
      background: vars.color.feedback.warning.soft,
    },
    '&[data-state="danger"]': {
      color: vars.color.feedback.danger.foreground,
      borderColor: vars.color.feedback.danger.border,
      background: vars.color.feedback.danger.soft,
    },
  },
});

export const counterCount = style({
  color: vars.color.foreground.default,
  fontWeight: 700,
  selectors: {
    [`${counter}[data-state="warning"] &`]: { color: vars.color.feedback.warning.foreground },
    [`${counter}[data-state="danger"] &`]: { color: vars.color.feedback.danger.foreground },
  },
});

export const counterSeparator = style({
  color: vars.color.foreground.subtle,
});

/* ---------- Resize grip (bottom-right corner) ---------- */

export const resizeGrip = style({
  position: 'absolute',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: vars.color.foreground.subtle,
  cursor: 'nwse-resize',
  transition: `color ${vars.duration.fast}, transform ${vars.duration.fast}`,
  selectors: {
    '&:hover': { color: vars.color.foreground.muted },
    '&:active': {
      color: vars.color.foreground.default,
      transform: 'scale(1.1)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent.ring}`,
      outlineOffset: '2px',
      borderRadius: vars.radius.sm,
    },
  },
});

/**
 * Per-size insets so the outermost grip stroke is tangent to the corner
 * radius. sm: r=sm (4px) → inset 3; md: r=md (6px) → inset 4; lg: r=lg (8px) → inset 5.
 */
export const resizeGripSize = styleVariants({
  sm: {
    bottom: '0.1875rem',
    right: '0.1875rem',
    width: '0.625rem',
    height: '0.625rem',
  },
  md: {
    bottom: '0.25rem',
    right: '0.25rem',
    width: '0.75rem',
    height: '0.75rem',
  },
  lg: {
    bottom: '0.3125rem',
    right: '0.3125rem',
    width: '0.875rem',
    height: '0.875rem',
  },
});
