import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Container } from './Container.js';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <Container paddingX={{ base: '4', md: '6' }}>
      <Box background="accent.soft" padding="6" borderRadius="md">
        Default Container size (lg = 1024px)
      </Box>
    </Container>
  ),
};

export const Prose: Story = {
  render: () => (
    <Container size="prose" paddingX={{ base: '4', md: '6' }}>
      <Box background="bg.surface" padding="6">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
          libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum
          imperdiet.
        </p>
      </Box>
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Box padding="4">
      {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Container key={size} size={size}>
          <Box background="accent.soft" padding="3" marginBottom="2" borderRadius="sm">
            size=&quot;{size}&quot;
          </Box>
        </Container>
      ))}
    </Box>
  ),
};
