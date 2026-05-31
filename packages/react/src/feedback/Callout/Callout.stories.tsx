import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Callout, CalloutContent, CalloutTitle } from './Callout.js';

const meta: Meta<typeof Callout> = {
  title: 'Feedback/Callout',
  component: Callout,
  parameters: { layout: 'padded' },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['accent', 'neutral', 'success', 'warning', 'danger'],
    },
    variant: { control: 'select', options: ['soft', 'outline'] },
  },
};
export default meta;
type Story = StoryObj<typeof Callout>;

const IconInfo = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-5" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
);

const COLOR_SCHEMES = ['accent', 'neutral', 'success', 'warning', 'danger'] as const;

export const Playground: Story = {
  args: {
    colorScheme: 'accent',
    variant: 'soft',
  },
  render: (args) => (
    <Callout {...args} icon={<IconInfo />}>
      <CalloutTitle>Good to know</CalloutTitle>
      <CalloutContent>
        <Text size="sm">
          Callouts are best used inline within long-form content to surface tips or caveats.
        </Text>
      </CalloutContent>
    </Callout>
  ),
};

export const StatusColors: Story = {
  render: () => (
    <Stack gap="3" width="520px">
      {COLOR_SCHEMES.map((scheme) => (
        <Callout key={scheme} colorScheme={scheme} icon={<IconInfo />}>
          <CalloutTitle>{scheme}</CalloutTitle>
          <CalloutContent>
            <Text size="sm">A {scheme} callout.</Text>
          </CalloutContent>
        </Callout>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="520px">
      {COLOR_SCHEMES.map((scheme) => (
        <Stack key={scheme} gap="2">
          <Callout colorScheme={scheme} variant="soft" icon={<IconInfo />}>
            <CalloutTitle>{scheme} — soft</CalloutTitle>
            <CalloutContent>
              <Text size="sm">Soft surface uses a tinted background.</Text>
            </CalloutContent>
          </Callout>
          <Callout colorScheme={scheme} variant="outline" icon={<IconInfo />}>
            <CalloutTitle>{scheme} — outline</CalloutTitle>
            <CalloutContent>
              <Text size="sm">Outline surface uses a border with transparent fill.</Text>
            </CalloutContent>
          </Callout>
        </Stack>
      ))}
    </Stack>
  ),
};

export const NoIcon: Story = {
  name: 'Without icon',
  render: () => (
    <Callout colorScheme="neutral" style={{ maxWidth: 520 }}>
      <CalloutTitle>Heads up</CalloutTitle>
      <CalloutContent>
        <Text size="sm">
          When no icon is provided the callout still renders cleanly — titles stay aligned.
        </Text>
      </CalloutContent>
    </Callout>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · renders title, body, and color scheme',
  render: () => (
    <Callout colorScheme="success" icon={<IconInfo />} data-testid="callout">
      <CalloutTitle>All systems operational</CalloutTitle>
      <CalloutContent>
        <Text size="sm">Everything is running smoothly.</Text>
      </CalloutContent>
    </Callout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const callout = canvas.getByTestId('callout');
    // Callout is a passive surface — it exposes its semantic palette rather
    // than a live-region role (use Alert for announcements).
    await expect(callout).toHaveAttribute('data-color-scheme', 'success');
    await expect(canvas.getByText('All systems operational')).toBeInTheDocument();
    await expect(canvas.getByText('Everything is running smoothly.')).toBeInTheDocument();
  },
};
