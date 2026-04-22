import { describe, expect, it } from 'vitest';
import { LAYOUT_PROP_KEYS, resolveLayoutProps, splitLayoutProps } from '../resolveLayoutProps.js';

describe('resolveLayoutProps', () => {
  it('returns undefined when no layout props supplied', () => {
    expect(resolveLayoutProps({})).toBeUndefined();
  });

  it('emits CSS custom properties for spacing tokens including auto', () => {
    const style = resolveLayoutProps({
      padding: '4',
      paddingX: '2',
      paddingY: '1',
      paddingTop: '0',
      paddingRight: '3',
      paddingBottom: '5',
      paddingLeft: '6',
      margin: 'auto',
      marginX: 'auto',
      marginY: '2',
      marginTop: '1',
      marginRight: '2',
      marginBottom: '3',
      marginLeft: '4',
    }) as Record<string, string>;
    expect(style['--cynosure-lp-p-base']).toContain('var(--cynosure-space-4)');
    expect(style['--cynosure-lp-m-base']).toBe('auto');
    expect(style['--cynosure-lp-mx-base']).toBe('auto');
    expect(style['--cynosure-lp-pl-base']).toContain('space-6');
  });

  it('emits size, color, border, radius, shadow, opacity, overflow vars', () => {
    const style = resolveLayoutProps({
      width: 'full',
      height: 'auto',
      minWidth: '200px',
      maxWidth: 'prose',
      minHeight: 'screen',
      maxHeight: 'fit',
      background: 'bg.surface',
      color: 'fg.default',
      borderColor: 'border.default',
      borderWidth: '2',
      borderStyle: 'solid',
      borderRadius: 'md',
      boxShadow: 'md',
      opacity: 0.5,
      overflow: 'hidden',
      overflowX: 'auto',
      overflowY: 'scroll',
    }) as Record<string, string>;
    expect(style['--cynosure-lp-bw-base']).toBe('2px');
    expect(style['--cynosure-lp-bs-base']).toBe('solid');
    expect(style['--cynosure-lp-op-base']).toBe('0.5');
    expect(style['--cynosure-lp-ov-base']).toBe('hidden');
    expect(style['--cynosure-lp-bg-base']).toContain('var(');
    expect(style['--cynosure-lp-w-base']).toBeDefined();
  });

  it('falls back to `${v}px` for unknown borderWidth values', () => {
    const style = resolveLayoutProps({ borderWidth: '3' as never }) as Record<string, string>;
    expect(style['--cynosure-lp-bw-base']).toBe('3px');
  });

  it('emits position, display, inset, zIndex, grid and flex child vars', () => {
    const style = resolveLayoutProps({
      display: 'flex',
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      zIndex: 'modal',
      gridColumn: '1 / span 2',
      gridRow: '2',
      gridArea: 'main',
      flex: '1 1 auto',
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: 'auto',
      alignSelf: 'center',
      justifySelf: 'stretch',
      order: 2,
    }) as Record<string, string>;
    expect(style['--cynosure-lp-d-base']).toBe('flex');
    expect(style['--cynosure-lp-pos-base']).toBe('absolute');
    expect(style['--cynosure-lp-as-base']).toBe('center');
    expect(style['--cynosure-lp-js-base']).toBe('stretch');
    expect(style['--cynosure-lp-fb-base']).toBe('auto');
    expect(style['--cynosure-lp-order-base']).toBe('2');
  });

  it('flexBasis resolves "content" verbatim and tokens through resolveSize', () => {
    const a = resolveLayoutProps({ flexBasis: 'content' }) as Record<string, string>;
    expect(a['--cynosure-lp-fb-base']).toBe('content');
    const b = resolveLayoutProps({ flexBasis: '4' }) as Record<string, string>;
    expect(b['--cynosure-lp-fb-base']).toContain('var(');
  });

  it('alignSelf and justifySelf fall through unknown values via the ?? branch', () => {
    const style = resolveLayoutProps({
      alignSelf: 'inherit' as never,
      justifySelf: 'inherit' as never,
    }) as Record<string, string>;
    expect(style['--cynosure-lp-as-base']).toBe('inherit');
    expect(style['--cynosure-lp-js-base']).toBe('inherit');
  });

  it('alignSelf maps known keys (start/end/auto/stretch/baseline)', () => {
    const style = resolveLayoutProps({ alignSelf: 'start' }) as Record<string, string>;
    expect(style['--cynosure-lp-as-base']).toBe('flex-start');
    const style2 = resolveLayoutProps({ alignSelf: 'end' }) as Record<string, string>;
    expect(style2['--cynosure-lp-as-base']).toBe('flex-end');
  });

  it('handles responsive object form across breakpoints', () => {
    const style = resolveLayoutProps({
      padding: { base: '2', md: '4', lg: '6' },
    }) as Record<string, string>;
    expect(style['--cynosure-lp-p-base']).toBeDefined();
    expect(style['--cynosure-lp-p-md']).toBeDefined();
    expect(style['--cynosure-lp-p-lg']).toBeDefined();
  });
});

describe('splitLayoutProps', () => {
  it('separates layout-keyed props from arbitrary rest props', () => {
    const { layoutProps, rest } = splitLayoutProps({
      padding: '4',
      width: 'full',
      onClick: () => {},
      'data-testid': 'x',
    } as never);
    expect(layoutProps).toEqual({ padding: '4', width: 'full' });
    expect(rest).toHaveProperty('onClick');
    expect(rest).toHaveProperty('data-testid', 'x');
    expect((rest as Record<string, unknown>).padding).toBeUndefined();
  });

  it('returns empty containers when no props are passed', () => {
    const { layoutProps, rest } = splitLayoutProps({} as never);
    expect(layoutProps).toEqual({});
    expect(rest).toEqual({});
  });

  it('LAYOUT_PROP_KEYS contains every layout key it claims to split', () => {
    expect(LAYOUT_PROP_KEYS.has('padding')).toBe(true);
    expect(LAYOUT_PROP_KEYS.has('flexBasis')).toBe(true);
    expect(LAYOUT_PROP_KEYS.has('justifySelf')).toBe(true);
    expect(LAYOUT_PROP_KEYS.has('order')).toBe(true);
  });
});
