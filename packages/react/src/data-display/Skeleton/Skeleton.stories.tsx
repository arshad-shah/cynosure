import type { Meta, StoryObj } from '@storybook/react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { Card, CardBody, CardFooter, CardHeader } from '../Card/Card.js';
import { Skeleton } from './Skeleton.js';

const meta: Meta<typeof Skeleton> = {
  title: 'Data Display/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['text', 'rect', 'circle'] },
    animation: { control: 'select', options: ['pulse', 'wave', 'none'] },
  },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Basic: Story = {
  args: { width: 240, height: 12 },
};

export const Variants: Story = {
  render: () => (
    <Inline gap="6" align="center">
      <Stack gap="2" align="center">
        <Skeleton variant="text" width={160} />
        <Text size="xs" color="fg.muted">
          text
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Skeleton variant="rect" width={160} height={80} />
        <Text size="xs" color="fg.muted">
          rect
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Skeleton variant="circle" width={56} height={56} />
        <Text size="xs" color="fg.muted">
          circle
        </Text>
      </Stack>
    </Inline>
  ),
};

export const Animations: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      {(['pulse', 'wave', 'none'] as const).map((animation) => (
        <Stack key={animation} gap="1">
          <Text size="sm" color="fg.muted">
            animation="{animation}"
          </Text>
          <Skeleton animation={animation} width="100%" height={20} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const TextLines: Story = {
  name: 'Text lines',
  render: () => (
    <Stack gap="2" width="360px">
      <Skeleton width="90%" />
      <Skeleton width="100%" />
      <Skeleton width="95%" />
      <Skeleton width="70%" />
      <Skeleton width="40%" />
    </Stack>
  ),
};

export const Avatar: Story = {
  name: 'Avatar + name pair',
  render: () => (
    <Inline gap="3" align="center">
      <Skeleton variant="circle" width={48} height={48} />
      <Stack gap="2">
        <Skeleton width={160} height={12} />
        <Skeleton width={120} height={10} />
      </Stack>
    </Inline>
  ),
};

export const CardSkeleton: Story = {
  name: 'Card skeleton',
  render: () => (
    <Card variant="outlined" style={{ maxWidth: 360 }}>
      <Skeleton variant="rect" width="100%" aspectRatio={16 / 9} />
      <CardHeader>
        <Stack gap="2">
          <Skeleton width="70%" height={16} />
          <Skeleton width="40%" height={10} />
        </Stack>
      </CardHeader>
      <CardBody>
        <Stack gap="2">
          <Skeleton width="100%" />
          <Skeleton width="92%" />
          <Skeleton width="65%" />
        </Stack>
      </CardBody>
      <CardFooter>
        <Inline gap="2" justify="end">
          <Skeleton width={72} height={32} />
          <Skeleton width={96} height={32} />
        </Inline>
      </CardFooter>
    </Card>
  ),
};

export const ListSkeleton: Story = {
  name: 'List skeleton (6 rows)',
  render: () => (
    <Stack gap="3" width="420px">
      {Array.from({ length: 6 }, (_, i) => (
        <Inline key={`row-${i.toString()}`} gap="3" align="center">
          <Skeleton variant="circle" width={36} height={36} />
          <Stack gap="2" style={{ flex: 1 }}>
            <Skeleton width={`${(60 + ((i * 7) % 30)).toString()}%`} height={10} />
            <Skeleton width={`${(30 + ((i * 11) % 40)).toString()}%`} height={8} />
          </Stack>
          <Skeleton width={48} height={24} />
        </Inline>
      ))}
    </Stack>
  ),
};

export const PageLoading: Story = {
  name: 'Page-level loading',
  render: () => (
    <Stack gap="6" width="720px">
      <Stack gap="2">
        <Skeleton width={220} height={28} />
        <Skeleton width={360} height={12} />
      </Stack>
      <Inline gap="4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={`stat-${i.toString()}`} variant="elevated" style={{ flex: 1 }}>
            <CardBody>
              <Stack gap="2">
                <Skeleton width="40%" height={10} />
                <Skeleton width="70%" height={28} />
                <Skeleton width="55%" height={8} />
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Inline>
      <Stack gap="2">
        <Heading level={3} size="sm">
          <Skeleton width={160} height={18} />
        </Heading>
        <Stack gap="3">
          {Array.from({ length: 4 }, (_, i) => (
            <Inline key={`item-${i.toString()}`} gap="3" align="center">
              <Skeleton variant="circle" width={32} height={32} />
              <Skeleton width="60%" height={10} />
              <Skeleton width={64} height={24} />
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
};

export const CustomRadius: Story = {
  name: 'Custom radius via style',
  render: () => (
    <Inline gap="3">
      <Skeleton variant="rect" width={80} height={80} style={{ borderRadius: 4 }} />
      <Skeleton variant="rect" width={80} height={80} style={{ borderRadius: 12 }} />
      <Skeleton variant="rect" width={80} height={80} style={{ borderRadius: 24 }} />
      <Skeleton variant="circle" width={80} height={80} />
    </Inline>
  ),
};
