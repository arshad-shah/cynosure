import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider } from '../../../theme/index.js';
import { Box } from '../Box/Box.js';
import { Inline } from './Inline.js';

const meta: Meta<typeof Inline> = {
  title: 'Layout/Inline',
  component: Inline,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Inline>;

const Pill = ({ children }: { children: React.ReactNode }) => (
  <Box paddingX="3" paddingY="1" background="accent.soft" color="accent.solid" borderRadius="full">
    {children}
  </Box>
);

export const Default: Story = {
  render: () => (
    <Inline gap="2">
      <Pill>one</Pill>
      <Pill>two</Pill>
      <Pill>three</Pill>
    </Inline>
  ),
};

export const Wraps: Story = {
  render: () => (
    <Inline gap="2" maxWidth="320px">
      {Array.from({ length: 12 }, (_, i) => `tag-${i + 1}`).map((tag) => (
        <Pill key={tag}>{tag}</Pill>
      ))}
    </Inline>
  ),
};

export const NoWrap: Story = {
  render: () => (
    <Inline gap="2" wrap={false} maxWidth="320px" overflowX="auto">
      {Array.from({ length: 12 }, (_, i) => `tag-${i + 1}`).map((tag) => (
        <Pill key={tag}>{tag}</Pill>
      ))}
    </Inline>
  ),
};

export const Rtl: Story = {
  render: () => (
    <DirectionProvider dir="rtl">
      <Inline gap="2" align="center">
        <Pill>واحد</Pill>
        <Pill>اثنان</Pill>
        <Pill>ثلاثة</Pill>
      </Inline>
    </DirectionProvider>
  ),
};
