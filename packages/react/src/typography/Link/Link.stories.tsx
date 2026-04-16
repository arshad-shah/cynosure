import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../Text/Text.js';
import { Link } from './Link.js';

const meta: Meta<typeof Link> = {
  title: 'Typography/Link',
  component: Link,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Link>;

export const Variants: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="/docs">Default link</Link>
      <Link href="/docs" variant="subtle">
        Subtle link
      </Link>
      <Link href="/docs" variant="emphasis">
        Emphasised link
      </Link>
    </Stack>
  ),
};

export const Underlines: Story = {
  render: () => (
    <Stack gap="2">
      <Link href="/x" underline="always">
        always underlined
      </Link>
      <Link href="/x" underline="hover">
        underline on hover
      </Link>
      <Link href="/x" underline="none">
        never underlined
      </Link>
    </Stack>
  ),
};

export const External: Story = {
  render: () => (
    <Text>
      Read more at{' '}
      <Link href="https://example.com" external>
        example.com
      </Link>
      .
    </Text>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Link href="/x" disabled>
      Disabled link
    </Link>
  ),
};
