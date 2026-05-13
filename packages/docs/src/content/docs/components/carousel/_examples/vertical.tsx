import {
  Carousel,
  CarouselContainer,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from '@arshad-shah/cynosure-react';

const slides = ['Inbox', 'Drafts', 'Sent', 'Archive'];

export default function Example() {
  return (
    <div style={{ width: '20rem' }}>
      <Carousel orientation="vertical" style={{ height: 240 }}>
        <CarouselViewport style={{ height: '100%' }}>
          <CarouselContainer style={{ flexDirection: 'column', height: '100%' }}>
            {slides.map((label) => (
              <CarouselSlide key={label}>
                <div
                  style={{
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--cynosure-color-surface-2)',
                    borderRadius: 'var(--cynosure-radius-md)',
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
      </Carousel>
    </div>
  );
}
