import { describe, expect, it } from 'vitest';
import {
  resolveColor,
  resolveRadius,
  resolveShadow,
  resolveSize,
  resolveSpace,
  resolveZIndex,
} from '../shared/tokens.js';

describe('tokens resolvers', () => {
  it('resolveSpace handles fractional tokens', () => {
    expect(resolveSpace('4')).toBe('var(--lumen-space-4)');
    expect(resolveSpace('0.5')).toBe('var(--lumen-space-0-5)');
    expect(resolveSpace('auto')).toBe('auto');
  });

  it('resolveRadius maps to radius CSS var', () => {
    expect(resolveRadius('md')).toBe('var(--lumen-radius-md)');
    expect(resolveRadius('2xl')).toBe('var(--lumen-radius-2xl)');
  });

  it('resolveShadow kebab-cases camelCase tokens', () => {
    expect(resolveShadow('md')).toBe('var(--lumen-shadow-md)');
    expect(resolveShadow('focusRing')).toBe('var(--lumen-shadow-focus-ring)');
  });

  it('resolveZIndex maps to z CSS var', () => {
    expect(resolveZIndex('modal')).toBe('var(--lumen-z-modal)');
  });

  it('resolveColor handles all categories', () => {
    expect(resolveColor('bg.surface')).toBe('var(--lumen-color-background-surface)');
    expect(resolveColor('fg.default')).toBe('var(--lumen-color-foreground-default)');
    expect(resolveColor('border.focus')).toBe('var(--lumen-color-border-focus)');
    expect(resolveColor('accent.solid')).toBe('var(--lumen-color-accent-solid)');
    expect(resolveColor('accent.solidHover')).toBe('var(--lumen-color-accent-solid-hover)');
    expect(resolveColor('feedback.success.soft')).toBe('var(--lumen-color-feedback-success-soft)');
  });

  it('resolveSize handles aliases, lengths and space tokens', () => {
    expect(resolveSize('full')).toBe('100%');
    expect(resolveSize('auto')).toBe('auto');
    expect(resolveSize('fit')).toBe('fit-content');
    expect(resolveSize('screen')).toBe('100vh');
    expect(resolveSize('prose')).toBe('65ch');
    expect(resolveSize('200px')).toBe('200px');
    expect(resolveSize('50%')).toBe('50%');
    expect(resolveSize('4')).toBe('var(--lumen-space-4)');
  });
});
