import type { Meta, StoryObj } from '@storybook/react';
import { Check } from 'lucide-react';
import { Heading } from '../../typography/Heading/Heading.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { CircularProgress } from './CircularProgress.js';

const meta: Meta<typeof CircularProgress> = {
  title: 'Data Display/CircularProgress',
  component: CircularProgress,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    colorScheme: {
      control: 'select',
      options: ['accent', 'success', 'warning', 'danger', 'neutral'],
    },
    indeterminate: { control: 'boolean' },
    thickness: { control: 'number' },
  },
};
export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Basic: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <CircularProgress value={25} />
      <CircularProgress value={50} />
      <CircularProgress value={75} />
      <CircularProgress value={100} />
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Stack key={size} gap="1" align="center">
          <CircularProgress size={size} value={66} />
          <Text size="xs" color="fg.muted">
            {size}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const WithLabel: Story = {
  name: 'Centered label',
  render: () => (
    <Inline gap="4" align="center">
      <CircularProgress size="xl" value={72}>
        <Text size="sm" weight="bold">
          72%
        </Text>
      </CircularProgress>
      <CircularProgress size="xl" value={100}>
        <Text size="sm" weight="bold">
          Done
        </Text>
      </CircularProgress>
    </Inline>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <CircularProgress indeterminate />
      <CircularProgress indeterminate size="lg" colorScheme="success" />
      <CircularProgress indeterminate size="xl" colorScheme="danger" thickness={2} />
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="4">
      <Heading level={3} size="sm">
        Each scheme at 66%
      </Heading>
      <Inline gap="4" align="center">
        {(['accent', 'success', 'warning', 'danger', 'neutral'] as const).map((scheme) => (
          <Stack key={scheme} gap="1" align="center">
            <CircularProgress colorScheme={scheme} value={66} size="lg" />
            <Text size="xs" color="fg.muted">
              {scheme}
            </Text>
          </Stack>
        ))}
      </Inline>
    </Stack>
  ),
};

export const Completion: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <CircularProgress size="xl" value={100}>
        <Check size={20} strokeWidth={3} aria-hidden="true" />
      </CircularProgress>
      <Text size="sm" color="fg.muted">
        At 100% the ring auto-flips to the success scheme.
      </Text>
    </Inline>
  ),
};

export const Thickness: Story = {
  render: () => (
    <Inline gap="4" align="center">
      {[2, 3, 4, 6, 8].map((t) => (
        <Stack key={t} gap="1" align="center">
          <CircularProgress size="xl" value={60} thickness={t} />
          <Text size="xs" color="fg.muted">
            t={t.toString()}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};
