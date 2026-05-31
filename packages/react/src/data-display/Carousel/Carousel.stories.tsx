import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Card } from '../Card/Card.js';
import {
  Carousel,
  CarouselContainer,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
  CarouselViewport,
} from './Carousel.js';

const meta: Meta<typeof Carousel> = {
  title: 'Data display/Carousel',
  component: Carousel,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    loop: { control: 'boolean' },
    align: { control: 'select', options: ['start', 'center', 'end'] },
  },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const slides = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Slide ${i + 1}`,
  body: 'A themed slide demonstrating the carousel primitive.',
}));

export const Default: Story = {
  args: { slidesPerView: 1, loop: false, align: 'start' },
  render: (args) => (
    <div style={{ width: '36rem', maxWidth: '100%' }}>
      <Carousel {...args}>
        <CarouselViewport>
          <CarouselContainer>
            {slides.map((s) => (
              <CarouselSlide key={s.id}>
                <Card style={{ aspectRatio: '16 / 9' }}>
                  <Stack gap="2" padding="5">
                    <Heading as="h3" size="md">
                      {s.title}
                    </Heading>
                    <Text color="fg.muted">{s.body}</Text>
                  </Stack>
                </Card>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · Next advances the active slide',
  render: () => (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <Carousel slidesPerView={1} align="start">
        <CarouselViewport>
          <CarouselContainer>
            {slides.slice(0, 4).map((s) => (
              <CarouselSlide key={s.id}>
                <Card style={{ aspectRatio: '16 / 9' }}>
                  <Stack gap="1" padding="4">
                    <Heading as="h4" size="sm">
                      {s.title}
                    </Heading>
                  </Stack>
                </Card>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The dots act as a tablist; slide 1 starts selected.
    const dots = canvas.getAllByRole('tab');
    await expect(dots[0]).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => {
      expect(canvas.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    });
    await expect(canvas.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }));
    await waitFor(() => {
      expect(canvas.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');
    });
  },
};

export const ThreeUp: Story = {
  render: () => (
    <div style={{ width: '48rem', maxWidth: '100%' }}>
      <Carousel slidesPerView={3} align="start">
        <CarouselViewport>
          <CarouselContainer>
            {slides.map((s) => (
              <CarouselSlide key={s.id}>
                <Card style={{ aspectRatio: '4 / 3' }}>
                  <Stack gap="1" padding="4">
                    <Heading as="h4" size="sm">
                      {s.title}
                    </Heading>
                    <Text size="sm" color="fg.muted">
                      Gallery card
                    </Text>
                  </Stack>
                </Card>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const Looped: Story = {
  args: { loop: true, slidesPerView: 1 },
  render: (args) => (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <Carousel {...args}>
        <CarouselViewport>
          <CarouselContainer>
            {slides.slice(0, 4).map((s) => (
              <CarouselSlide key={s.id}>
                <Card style={{ aspectRatio: '16 / 9' }}>
                  <Stack gap="1" padding="4">
                    <Heading as="h4" size="sm">
                      {s.title}
                    </Heading>
                  </Stack>
                </Card>
              </CarouselSlide>
            ))}
          </CarouselContainer>
        </CarouselViewport>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
};
