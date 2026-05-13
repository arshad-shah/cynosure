import {
  Carousel,
  CarouselContainer,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from '@arshad-shah/cynosure-react';

const items = Array.from({ length: 8 }, (_, i) => i + 1);

export default function Example() {
  return (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <Carousel slidesPerView={{ base: 1, sm: 2, md: 3 }} align="start">
        <CarouselViewport>
          <CarouselContainer>
            {items.map((n) => (
              <CarouselSlide key={n} style={{ paddingInline: '0.25rem' }}>
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--cynosure-color-surface-2)',
                    borderRadius: 'var(--cynosure-radius-md)',
                    fontWeight: 600,
                  }}
                >
                  Card {n}
                </div>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
