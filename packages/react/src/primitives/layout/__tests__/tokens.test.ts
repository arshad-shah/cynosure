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
    expect(resolveSpace('4')).toBe('var(--cynosure-space-4)');
    expect(resolveSpace('0.5')).toBe('var(--cynosure-space-0-5)');
    expect(resolveSpace('auto')).toBe('auto');
  });

  it('resolveRadius maps to radius CSS var', () => {
    expect(resolveRadius('md')).toBe('var(--cynosure-radius-md)');
    expect(resolveRadius('2xl')).toBe('var(--cynosure-radius-2xl)');
  });

  it('resolveShadow kebab-cases camelCase tokens', () => {
    expect(resolveShadow('md')).toBe('var(--cynosure-shadow-md)');
    expect(resolveShadow('focusRing')).toBe('var(--cynosure-shadow-focus-ring)');
  });

  it('resolveZIndex maps to z CSS var', () => {
    expect(resolveZIndex('modal')).toBe('var(--cynosure-z-modal)');
  });

  it('resolveColor handles all categories', () => {
    expect(resolveColor('bg.surface')).toBe('var(--cynosure-color-background-surface)');
    expect(resolveColor('fg.default')).toBe('var(--cynosure-color-foreground-default)');
    expect(resolveColor('border.focus')).toBe('var(--cynosure-color-border-focus)');
    expect(resolveColor('accent.solid')).toBe('var(--cynosure-color-accent-solid)');
    expect(resolveColor('accent.solidHover')).toBe('var(--cynosure-color-accent-solid-hover)');
    expect(resolveColor('feedback.success.soft')).toBe(
      'var(--cynosure-color-feedback-success-soft)',
    );
  });

  it('resolveSize handles aliases, lengths and space tokens', () => {
    expect(resolveSize('full')).toBe('100%');
    expect(resolveSize('auto')).toBe('auto');
    expect(resolveSize('fit')).toBe('fit-content');
    expect(resolveSize('screen')).toBe('100vh');
    expect(resolveSize('prose')).toBe('65ch');
    expect(resolveSize('200px')).toBe('200px');
    expect(resolveSize('50%')).toBe('50%');
    expect(resolveSize('4')).toBe('var(--cynosure-space-4)');
  });
});
