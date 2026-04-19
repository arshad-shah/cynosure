import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { CynosureProvider } from '../CynosureProvider.js';

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock({ '(prefers-color-scheme: dark)': false });
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('dir');
  document.documentElement.style.colorScheme = '';
  window.localStorage.clear();
});

afterEach(() => {
  media.reset();
});

describe('CynosureProvider', () => {
  it('renders children and applies the default theme', () => {
    render(
      <CynosureProvider theme={{ defaultTheme: 'light' }}>
        <span>hello</span>
      </CynosureProvider>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('forwards a bare direction string to DirectionProvider', () => {
    render(
      <CynosureProvider theme={{ defaultTheme: 'light' }} direction="rtl">
        <span>rtl</span>
      </CynosureProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('forwards a direction props object', () => {
    render(
      <CynosureProvider theme={{ defaultTheme: 'light' }} direction={{ dir: 'rtl' }}>
        <span>rtl</span>
      </CynosureProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('works with no props — sensible defaults everywhere', () => {
    render(
      <CynosureProvider>
        <span>zero-config</span>
      </CynosureProvider>,
    );
    expect(screen.getByText('zero-config')).toBeInTheDocument();
  });
});
