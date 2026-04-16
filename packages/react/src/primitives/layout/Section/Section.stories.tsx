import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../Box/Box.js';
import { Container } from '../Container/Container.js';
import { Section } from './Section.js';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Section>;

export const Hero: Story = {
  render: () => (
    <Section space="xl" background="accent.solid" color="accent.onSolid">
      <Container>
        <Box>Hero section · space=&quot;xl&quot;</Box>
      </Container>
    </Section>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Box>
      {(['sm', 'md', 'lg', 'xl'] as const).map((space) => (
        <Section key={space} space={space} background="bg.subtle">
          <Container>
            <Box background="bg.surface" padding="3" borderRadius="sm">
              space=&quot;{space}&quot;
            </Box>
          </Container>
        </Section>
      ))}
    </Box>
  ),
};
