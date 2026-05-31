import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Anchor } from './Anchor.js';

/**
 * Real-browser computed-style check — the copy-link stays `opacity: 0` and is
 * revealed via the `:focus-within` / `:hover` CSS pseudo-classes on the
 * wrapper. jsdom neither applies stylesheet rules nor resolves pseudo-class
 * state, so the reveal behaviour can only be confirmed with a real engine.
 * Also verifies `offsetTop` flows into the `scroll-margin-top` custom property.
 * Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('Anchor reveals the copy link on focus-within', () => {
  render(
    <Anchor id="introduction" offsetTop={80}>
      Introduction
    </Anchor>,
  );

  const link = screen.getByRole('link', { name: 'Copy link to section' });
  // Hidden by default.
  expect(Number.parseFloat(getComputedStyle(link).opacity)).toBe(0);

  // Focusing the link triggers :focus-within on the wrapper, revealing it.
  link.focus();
  expect(Number.parseFloat(getComputedStyle(link).opacity)).toBe(1);

  // offsetTop is plumbed through to scroll-margin-top so sticky headers don't
  // cover the heading when scrolled into view.
  const heading = screen.getByRole('heading', { name: /Introduction/ });
  expect(getComputedStyle(heading).scrollMarginTop).toBe('80px');
});
