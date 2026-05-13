import {
  Carousel,
  CarouselContainer,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from '@arshad-shah/cynosure-react';

const slides = [
  { id: 1, title: 'Ship faster', body: 'Composable primitives for modern UIs.' },
  { id: 2, title: 'Design tokens', body: 'Themeable with first-class dark mode.' },
  { id: 3, title: 'Accessible', body: 'WAI-ARIA patterns built in.' },
];

export default function Example() {
  return (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <Carousel>
        <CarouselViewport>
          <CarouselContainer>
            {slides.map((s) => (
              <CarouselSlide key={s.id}>
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '1.5rem',
                    background: 'var(--cynosure-color-surface-2)',
                    borderRadius: 'var(--cynosure-radius-lg)',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0 }}>{s.title}</h3>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--cynosure-color-fg-muted)' }}>
                      {s.body}
                    </p>
                  </div>
                </div>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  );
}
