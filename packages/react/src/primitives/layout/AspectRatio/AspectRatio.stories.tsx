import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Center } from '../Center/Center.js';
import { Grid } from '../Grid/Grid.js';
import { Stack } from '../Stack/Stack.js';
import { AspectRatio } from './AspectRatio.js';

const meta: Meta<typeof AspectRatio> = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  parameters: { layout: 'padded' },
  argTypes: {
    ratio: {
      control: 'select',
      options: [1, 4 / 3, 3 / 2, 16 / 9, 2, '21 / 9'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof AspectRatio>;

const Pane = ({ label }: { label: string }) => (
  <Center
    width="full"
    height="full"
    background="accent.soft"
    color="accent.solid"
    borderRadius="md"
  >
    <Text weight="semibold">{label}</Text>
  </Center>
);

export const Playground: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <Box width="480px">
      <AspectRatio {...args}>
        <Pane label={`ratio = ${args.ratio}`} />
      </AspectRatio>
    </Box>
  ),
};

export const CommonRatios: Story = {
  render: () => (
    <Stack gap="5">
      <Stack gap="2">
        <Text variant="overline">1 / 1 — avatar, square card</Text>
        <Box width="200px">
          <AspectRatio ratio={1}>
            <Pane label="1 / 1" />
          </AspectRatio>
        </Box>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">4 / 3 — classic photo</Text>
        <Box width="320px">
          <AspectRatio ratio={4 / 3}>
            <Pane label="4 / 3" />
          </AspectRatio>
        </Box>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">16 / 9 — video, hero</Text>
        <Box width="480px">
          <AspectRatio ratio={16 / 9}>
            <Pane label="16 / 9" />
          </AspectRatio>
        </Box>
      </Stack>
      <Stack gap="2">
        <Text variant="overline">21 / 9 — ultrawide banner</Text>
        <Box width="560px">
          <AspectRatio ratio="21 / 9">
            <Pane label="21 / 9" />
          </AspectRatio>
        </Box>
      </Stack>
    </Stack>
  ),
};

export const VideoEmbed: Story = {
  render: () => (
    <Box width="560px">
      <AspectRatio ratio={16 / 9}>
        <Box
          as="iframe"
          title="Big Buck Bunny"
          src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
          width="100%"
          height="100%"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
          style={{ border: 0 }}
        />
      </AspectRatio>
    </Box>
  ),
};

export const ImageCover: Story = {
  render: () => (
    <Box width="400px">
      <AspectRatio ratio={4 / 3} borderRadius="lg" overflow="hidden">
        <Box
          as="img"
          src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=60"
          alt="Mountain range"
          width="100%"
          height="100%"
          style={{ objectFit: 'cover', display: 'block' }}
        />
      </AspectRatio>
    </Box>
  ),
};

export const ChartPlaceholder: Story = {
  render: () => (
    <Box
      padding="4"
      background="bg.surface"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      borderRadius="md"
      width="520px"
    >
      <Stack gap="3">
        <Heading level={4} size="md">
          Revenue by week
        </Heading>
        <AspectRatio ratio={16 / 6}>
          <Center
            background="bg.subtle"
            borderRadius="sm"
            borderWidth="1"
            borderStyle="dashed"
            borderColor="border.default"
          >
            <Text color="fg.muted">[chart placeholder]</Text>
          </Center>
        </AspectRatio>
      </Stack>
    </Box>
  ),
};

export const GalleryGrid: Story = {
  render: () => (
    <Grid columns={{ base: 2, md: 4 }} gap="3" width="full" maxWidth="720px">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <AspectRatio
          key={n}
          ratio={1}
          borderRadius="md"
          overflow="hidden"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Center width="full" height="full" background="accent.soft" color="accent.solid">
            <Text weight="semibold">{n}</Text>
          </Center>
        </AspectRatio>
      ))}
    </Grid>
  ),
};

export const AsChild: Story = {
  name: 'asChild — ratio on an <a>',
  render: () => (
    <Box width="280px">
      <AspectRatio asChild ratio={4 / 3}>
        <a href="#top" style={{ display: 'block', textDecoration: 'none' }}>
          <Center
            width="full"
            height="full"
            background="accent.solid"
            color="accent.onSolid"
            borderRadius="md"
          >
            <Text weight="semibold">Clickable tile</Text>
          </Center>
        </a>
      </AspectRatio>
    </Box>
  ),
};
