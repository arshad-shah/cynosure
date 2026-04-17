import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../forms/Button/Button.js';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { Grid } from '../../primitives/layout/Grid/Grid.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardMedia,
  CardTitle,
} from './Card.js';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'elevated', 'filled', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    interactive: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

const IconHeart = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

const IconShare = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const Basic: Story = {
  args: { variant: 'outlined', size: 'md' },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <CardHeader>
        <CardTitle>Weekly digest</CardTitle>
        <CardDescription>Your activity summary for the past 7 days.</CardDescription>
      </CardHeader>
      <CardBody>
        <Text>
          You shipped 14 commits across 3 repositories and closed 6 issues. Nicely paced week.
        </Text>
      </CardBody>
      <CardFooter>
        <Inline gap="2" justify="end">
          <Button variant="ghost">Dismiss</Button>
          <Button>Open report</Button>
        </Inline>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <Grid columns={{ base: 1, md: 2 }} gap="4">
      {(['outlined', 'elevated', 'filled', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <CardTitle>{variant}</CardTitle>
            <CardDescription>Variant: {variant}</CardDescription>
          </CardHeader>
          <CardBody>
            <Text>Card bodies maintain consistent padding regardless of variant.</Text>
          </CardBody>
        </Card>
      ))}
    </Grid>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Card key={size} size={size}>
          <CardHeader>
            <CardTitle>Size: {size}</CardTitle>
            <CardDescription>Padding scales with the size token.</CardDescription>
          </CardHeader>
          <CardBody>
            <Text>The body maintains hierarchy at every size.</Text>
          </CardBody>
        </Card>
      ))}
    </Stack>
  ),
};

export const Article: Story = {
  name: 'Article card with image',
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 420 }}>
      <CardImage
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60"
        aspectRatio={16 / 9}
        alt="A forested valley at sunrise"
      />
      <CardHeader>
        <CardTitle>The long road back to the mountains</CardTitle>
        <CardDescription>Issue 42 — Outdoor journal</CardDescription>
      </CardHeader>
      <CardBody>
        <Text>
          After three years away, the familiar ridgeline felt taller, the switchbacks steeper. We
          trace a route from trailhead to summit, one vertebra at a time.
        </Text>
      </CardBody>
      <CardFooter>
        <Inline gap="3" align="center" justify="between">
          <Text size="sm" color="fg.muted">
            6 min read
          </Text>
          <Button variant="ghost" size="sm">
            Read article
          </Button>
        </Inline>
      </CardFooter>
    </Card>
  ),
};

export const Product: Story = {
  name: 'Product card with actions',
  render: () => (
    <Card variant="outlined" interactive style={{ maxWidth: 320 }}>
      <CardImage
        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=60"
        aspectRatio={1}
        alt="Red high-top sneakers"
      />
      <CardBody>
        <Stack gap="2">
          <Text size="sm" color="fg.muted">
            Footwear · Unisex
          </Text>
          <CardTitle as="h3">Air Retro 84</CardTitle>
          <Inline gap="2" align="baseline">
            <Text weight="bold" size="lg">
              €129
            </Text>
            <Text size="sm" color="fg.muted" style={{ textDecoration: 'line-through' }}>
              €149
            </Text>
          </Inline>
        </Stack>
      </CardBody>
      <CardFooter>
        <Inline gap="2" justify="between" align="center">
          <Inline gap="1">
            <IconButton icon={<IconHeart />} label="Add to favourites" variant="ghost" size="sm" />
            <IconButton icon={<IconShare />} label="Share" variant="ghost" size="sm" />
          </Inline>
          <Button size="sm">Add to bag</Button>
        </Inline>
      </CardFooter>
    </Card>
  ),
};

export const Stat: Story = {
  name: 'Stat / metric card',
  render: () => (
    <Grid columns={{ base: 1, sm: 3 }} gap="4">
      <Card variant="elevated">
        <CardBody>
          <Stack gap="1">
            <Text size="sm" color="fg.muted">
              Monthly revenue
            </Text>
            <Text size="xl" weight="bold">
              $48,290
            </Text>
            <Text size="sm" color="feedback.success.solid">
              ↑ 12.4% vs last month
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardBody>
          <Stack gap="1">
            <Text size="sm" color="fg.muted">
              Active users
            </Text>
            <Text size="xl" weight="bold">
              9,820
            </Text>
            <Text size="sm" color="feedback.success.solid">
              ↑ 3.1% vs last month
            </Text>
          </Stack>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardBody>
          <Stack gap="1">
            <Text size="sm" color="fg.muted">
              Churn rate
            </Text>
            <Text size="xl" weight="bold">
              2.1%
            </Text>
            <Text size="sm" color="feedback.danger.solid">
              ↓ 0.4% vs last month
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Grid>
  ),
};

export const Horizontal: Story = {
  name: 'Horizontal layout',
  render: () => (
    <Card orientation="horizontal" variant="outlined" style={{ maxWidth: 560 }}>
      <CardImage
        horizontal
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60"
        alt="A stack of toast on a white plate"
        style={{ width: 180 }}
      />
      <Stack gap="0" style={{ flex: 1 }}>
        <CardHeader>
          <CardTitle>Sourdough fundamentals</CardTitle>
          <CardDescription>30 min · 4 ingredients</CardDescription>
        </CardHeader>
        <CardBody>
          <Text>
            Learn the starter-to-loaf cycle, why hydration matters, and how to troubleshoot dense
            crumb.
          </Text>
        </CardBody>
      </Stack>
    </Card>
  ),
};

export const Interactive: Story = {
  name: 'Interactive (clickable)',
  render: () => (
    <Grid columns={{ base: 1, sm: 2 }} gap="4">
      <Card
        interactive
        onClick={() => {
          window.alert('Clicked: Design tokens');
        }}
      >
        <CardHeader>
          <CardTitle>Design tokens</CardTitle>
          <CardDescription>Colours, spacing, typography.</CardDescription>
        </CardHeader>
        <CardBody>
          <Text>The single source of truth for every visual primitive.</Text>
        </CardBody>
      </Card>
      <Card
        interactive
        onClick={() => {
          window.alert('Clicked: Components');
        }}
      >
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>Composable building blocks.</CardDescription>
        </CardHeader>
        <CardBody>
          <Text>Browse the catalogue of accessible, themeable primitives.</Text>
        </CardBody>
      </Card>
    </Grid>
  ),
};

export const WithMedia: Story = {
  name: 'Custom media (video)',
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 420 }}>
      <CardMedia aspectRatio={16 / 9}>
        <video
          muted
          autoPlay
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-1173-large.mp4"
        >
          <track kind="captions" />
        </video>
      </CardMedia>
      <CardHeader>
        <CardTitle>Autumn reel</CardTitle>
        <CardDescription>Captured on a Fujifilm X-T5.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

export const LongContent: Story = {
  name: 'Edge case — long content',
  render: () => (
    <Card variant="outlined" style={{ maxWidth: 480 }}>
      <CardHeader>
        <CardTitle>
          A much longer title that might be expected to wrap onto multiple lines inside a compact
          card layout
        </CardTitle>
        <CardDescription>
          The description explains what the card contains, why the reader should care, and gives
          just enough context to decide whether to click through.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at suscipit metus, ac
          lobortis nunc. Integer ornare pharetra orci, sit amet vehicula libero pulvinar vel. Nulla
          facilisi. Cras sed ante quis nibh convallis bibendum. Suspendisse potenti.
        </Text>
      </CardBody>
    </Card>
  ),
};
