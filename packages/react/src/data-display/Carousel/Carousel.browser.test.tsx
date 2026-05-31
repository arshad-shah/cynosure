import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { carouselViewport } from './Carousel.css.js';
import {
  Carousel,
  CarouselContainer,
  CarouselNext,
  CarouselSlide,
  CarouselViewport,
} from './Carousel.js';

/**
 * Real-browser layout check — the carousel is driven by Embla, which measures
 * slide widths and applies a `translate3d` offset to the track. jsdom has no
 * layout engine, so Embla never computes slide geometry and the slide cannot
 * actually move. This verifies that clicking Next shifts the first slide left
 * by roughly one viewport width. Runs across the Chromium/Firefox/WebKit
 * matrix in CI.
 */
test('Carousel shifts the active slide left when advancing', async () => {
  const { container } = render(
    <div style={{ width: 400 }}>
      <Carousel slidesPerView={1} align="start">
        <CarouselViewport>
          <CarouselContainer>
            {[0, 1, 2].map((i) => (
              <CarouselSlide key={`slide-${i.toString()}`}>
                <div style={{ height: 120 }}>Slide {i + 1}</div>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselNext />
      </Carousel>
    </div>,
  );

  const viewport = container.querySelector<HTMLElement>(`.${carouselViewport.split(' ')[0]}`);
  if (!viewport) throw new Error('viewport missing');
  const firstSlide = screen.getByText('Slide 1').closest('[role="group"]') as HTMLElement;

  const viewportLeft = viewport.getBoundingClientRect().left;
  const before = firstSlide.getBoundingClientRect().left - viewportLeft;
  // Slide 1 starts aligned to the viewport's start edge.
  expect(Math.abs(before)).toBeLessThanOrEqual(2);

  fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));

  await waitFor(
    () => {
      const after = firstSlide.getBoundingClientRect().left - viewportLeft;
      // After advancing, slide 1 has scrolled off to the left by ~one width.
      expect(after).toBeLessThan(-100);
    },
    { timeout: 2000 },
  );
});
