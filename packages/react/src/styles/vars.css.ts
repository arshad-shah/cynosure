import { createGlobalThemeContract } from '@vanilla-extract/css';

/**
 * Typed mirror of the `@arshad-shah/cynosure-tokens` CSS custom properties.
 *
 * The contract only types the names — consumers must import
 * `@arshad-shah/cynosure-tokens/css` (and optionally `@arshad-shah/cynosure-tokens/css/dark`) at runtime for
 * the values. Every leaf is the CSS variable name (sans the leading `--`),
 * so referring to e.g. `vars.color.accent.solid` inside a `.css.ts` file
 * emits `var(--cynosure-color-accent-solid)` at build time.
 *
 * The key shape here mirrors the token tree *logically*. The `path` mapper
 * below performs the camelCase → kebab-case and `.` → `-` transforms that
 * Style Dictionary performs for the actual CSS custom property names, so the
 * contract stays a faithful reflection of the token CSS.
 */
const toCssName = (path: string[]): string =>
  path
    .map((seg) =>
      seg
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\./g, '-')
        .toLowerCase(),
    )
    .join('-');

export const vars = createGlobalThemeContract(
  {
    color: {
      background: {
        canvas: '',
        surface: '',
        subtle: '',
        muted: '',
        raised: '',
        overlay: '',
        inverse: '',
      },
      foreground: {
        default: '',
        muted: '',
        subtle: '',
        disabled: '',
        inverse: '',
        onAccent: '',
      },
      border: {
        default: '',
        subtle: '',
        strong: '',
        focus: '',
        disabled: '',
      },
      accent: {
        solid: '',
        solidHover: '',
        solidActive: '',
        soft: '',
        softHover: '',
        softActive: '',
        ring: '',
        onSolid: '',
      },
      feedback: {
        success: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        danger: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        warning: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
        info: { solid: '', soft: '', foreground: '', border: '', onSolid: '' },
      },
    },
    space: {
      '0': '',
      '0.5': '',
      '1': '',
      '1.5': '',
      '2': '',
      '3': '',
      '4': '',
      '5': '',
      '6': '',
      '8': '',
      '10': '',
      '12': '',
      '16': '',
      '20': '',
      '24': '',
      '32': '',
      '40': '',
      '48': '',
      '64': '',
    },
    radius: {
      none: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      full: '',
    },
    shadow: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
      '2xl': '',
      focusRing: '',
    },
    duration: {
      instant: '',
      fast: '',
      normal: '',
      slow: '',
      slower: '',
    },
    easing: {
      linear: '',
      easeIn: '',
      easeOut: '',
      easeInOut: '',
      spring: '',
      bounce: '',
    },
    z: {
      hide: '',
      base: '',
      docked: '',
      dropdown: '',
      sticky: '',
      overlay: '',
      modal: '',
      popover: '',
      toast: '',
      tooltip: '',
    },
  },
  (_value, path) => `cynosure-${toCssName(path as string[])}`,
);

export type Vars = typeof vars;
