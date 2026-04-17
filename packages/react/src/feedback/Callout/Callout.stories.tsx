import type { Meta, StoryObj } from '@storybook/react';
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

const IconBulb = (): React.ReactElement => (
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
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.8.8 1.2 1.5 1.2 2.3V18h5.6v-1c0-.8.4-1.5 1.2-2.3A7 7 0 0 0 12 2Z" />
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

export const InlineInProse: Story = {
  name: 'Inline in prose — as you would use it in MDX',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Text as="p">
        Lumen UI is a themable component system built on vanilla-extract. It ships accessible
        primitives for forms, feedback, navigation, and overlays. Tokens are mirrored in CSS custom
        properties so you can mix it with plain CSS freely.
      </Text>
      <Callout colorScheme="accent" icon={<IconBulb />}>
        <CalloutTitle>Tip</CalloutTitle>
        <CalloutContent>
          <Text size="sm">
            Reach for <code>Callout</code> inside documentation or MDX — for UI surfaces use
            <code> Alert</code> or <code>Banner</code> instead.
          </Text>
        </CalloutContent>
      </Callout>
      <Text as="p">
        Every component forwards refs, accepts <code>className</code>, and spreads native props.
        Composition is preferred over magic props.
      </Text>
    </div>
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

export const TitleOnly: Story = {
  name: 'Edge case — title only, no content',
  render: () => (
    <Stack gap="3" width="520px">
      <Callout colorScheme="success" icon={<IconInfo />}>
        <CalloutTitle>All systems operational.</CalloutTitle>
      </Callout>
      <Callout colorScheme="warning" variant="outline" icon={<IconInfo />}>
        <CalloutTitle>Remember to save before you close this tab.</CalloutTitle>
      </Callout>
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Edge case — long prose wraps',
  render: () => (
    <Callout colorScheme="accent" icon={<IconBulb />} style={{ maxWidth: 640 }}>
      <CalloutTitle>Why vanilla-extract?</CalloutTitle>
      <CalloutContent>
        <Text size="sm">
          vanilla-extract gives us the ergonomics of CSS-in-JS at build time — zero runtime
          overhead, atomic CSS extraction, full IDE support, and complete type safety from token to
          selector. It plays nicely with SSR, streams cleanly, and scales to a system of hundreds of
          primitives without the usual runtime tax.
        </Text>
      </CalloutContent>
    </Callout>
  ),
};
