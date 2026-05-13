import {
  Carousel,
  CarouselContainer,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from '@arshad-shah/cynosure-react';

const slides = ['Alpha', 'Bravo', 'Charlie', 'Delta'];

export default function Example() {
  return (
    <div style={{ width: '28rem', maxWidth: '100%' }}>
      <Carousel loop>
        <CarouselViewport>
          <CarouselContainer>
            {slides.map((label) => (
              <CarouselSlide key={label}>
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--cynosure-color-surface-2)',
                    borderRadius: 'var(--cynosure-radius-lg)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                  }}
                >
                  {label}
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
