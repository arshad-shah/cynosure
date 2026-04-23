import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Carousel,
  CarouselContainer,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from '../Carousel/index.js';

function Harness(props: React.ComponentProps<typeof Carousel> = {}) {
  return (
    <Carousel {...props}>
      <CarouselViewport>
        <CarouselContainer>
          <CarouselSlide>one</CarouselSlide>
          <CarouselSlide>two</CarouselSlide>
          <CarouselSlide>three</CarouselSlide>
        </CarouselContainer>
      </CarouselViewport>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

describe('Carousel', () => {
  it('renders viewport + slides + controls', () => {
    render(<Harness />);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
  });

  it('marks the root with aria-roledescription="carousel"', () => {
    const { container } = render(<Harness />);
    const root = container.querySelector('[aria-roledescription="carousel"]');
    expect(root).not.toBeNull();
  });

  it('applies the orientation data attribute', () => {
    const { container } = render(<Harness orientation="vertical" />);
    expect(container.querySelector('[data-orientation="vertical"]')).not.toBeNull();
  });

  it('renders with a custom slidesPerView number', () => {
    render(<Harness slidesPerView={3} />);
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('accepts a responsive slidesPerView object', () => {
    render(<Harness slidesPerView={{ base: 1, sm: 2, md: 3 }} />);
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('throws when primitives are used outside of <Carousel>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<CarouselViewport>x</CarouselViewport>)).toThrow(
      /Carousel primitives must be rendered inside/,
    );
    spy.mockRestore();
  });

  it('handles keydown on the root without throwing', () => {
    const { container } = render(<Harness />);
    const root = container.querySelector('[aria-roledescription="carousel"]') as HTMLElement;
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    fireEvent.keyDown(root, { key: 'Escape' });
    expect(root).toBeInTheDocument();
  });

  it('handles keydown on the root (vertical) without throwing', () => {
    const { container } = render(<Harness orientation="vertical" />);
    const root = container.querySelector('[aria-roledescription="carousel"]') as HTMLElement;
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(root).toBeInTheDocument();
  });
});
