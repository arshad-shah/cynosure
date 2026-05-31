import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { useTheme } from '../../theme/hooks/useTheme.js';
import { Text } from '../../typography/Text/Text.js';
import { ThemeToggle } from './ThemeToggle.js';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Forms/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['icon', 'switch', 'segmented', 'menu'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showLabels: { control: 'boolean' },
  },
  // Every story needs a ThemeProvider — ThemeToggle reads/writes the active
  // theme through `useTheme()`. Storage is disabled so stories don't leak
  // their selection into each other or persist to the docs site.
  decorators: [
    (Story) => (
      <ThemeProvider themes={['light', 'dark']} defaultTheme="system" storage={null}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ThemeToggle>;

function CurrentTheme(): React.ReactElement {
  const { theme, resolvedTheme } = useTheme();
  return (
    <Text size="sm" color="fg.muted">
      theme: <strong>{theme}</strong> · resolved: <strong>{resolvedTheme}</strong>
    </Text>
  );
}

export const Playground: Story = {
  args: { variant: 'icon', size: 'md' },
  render: (args) => (
    <Stack gap="3" align="start">
      <ThemeToggle {...args} />
      <CurrentTheme />
    </Stack>
  ),
};

export const Variants: Story = {
  name: 'Variants — icon / switch / segmented / menu',
  render: () => (
    <Stack gap="5" align="start">
      <Stack gap="2" align="start">
        <Text size="sm" weight="medium">
          Icon (cycles light → dark → system)
        </Text>
        <ThemeToggle variant="icon" />
      </Stack>
      <Stack gap="2" align="start">
        <Text size="sm" weight="medium">
          Switch (binary light ↔ dark)
        </Text>
        <ThemeToggle variant="switch" />
      </Stack>
      <Stack gap="2" align="start">
        <Text size="sm" weight="medium">
          Segmented
        </Text>
        <ThemeToggle variant="segmented" />
      </Stack>
      <Stack gap="2" align="start">
        <Text size="sm" weight="medium">
          Menu
        </Text>
        <ThemeToggle variant="menu" />
      </Stack>
      <CurrentTheme />
    </Stack>
  ),
};

export const Segmented: Story = {
  render: () => (
    <Stack gap="3" align="start">
      <ThemeToggle variant="segmented" />
      <ThemeToggle variant="segmented" showLabels />
      <CurrentTheme />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <ThemeToggle variant="segmented" size="sm" />
      <ThemeToggle variant="segmented" size="md" />
      <ThemeToggle variant="segmented" size="lg" />
    </Inline>
  ),
};

export const LightDarkOnly: Story = {
  name: 'Without the system option',
  render: () => (
    <Stack gap="3" align="start">
      <ThemeToggle variant="segmented" modes={['light', 'dark']} showLabels />
      <ThemeToggle variant="icon" modes={['light', 'dark']} />
      <CurrentTheme />
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · segmented selects dark',
  render: () => (
    <Stack gap="3" align="start">
      <ThemeToggle variant="segmented" modes={['light', 'dark']} showLabels />
      <CurrentTheme />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });
    await expect(dark).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(dark);
    await expect(dark).toHaveAttribute('aria-checked', 'true');
  },
};
