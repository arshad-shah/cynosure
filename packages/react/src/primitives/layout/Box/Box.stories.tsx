import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider } from '../../../theme/index.js';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Box } from './Box.js';

const meta: Meta<typeof Box> = {
  title: 'Layout/Box',
  component: Box,
  parameters: { layout: 'padded' },
  argTypes: {
    background: {
      control: 'select',
      options: ['bg.canvas', 'bg.surface', 'bg.subtle', 'bg.muted', 'accent.soft', 'accent.solid'],
    },
    color: {
      control: 'select',
      options: ['fg.default', 'fg.muted', 'fg.subtle', 'accent.solid', 'accent.onSolid'],
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    boxShadow: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    padding: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Box>;

export const Playground: Story = {
  args: {
    padding: '4',
    background: 'bg.surface',
    color: 'fg.default',
    borderRadius: 'md',
    borderWidth: '1',
    borderStyle: 'solid',
    borderColor: 'border.default',
    children: 'Box content',
  },
};

// ── Padding / margin surface ───────────────────────────────────────────

export const PaddingAndMargin: Story = {
  render: () => (
    <Stack gap="4">
      <Box background="bg.subtle" borderRadius="md">
        <Box padding="4" background="accent.soft" color="accent.solid" borderRadius="sm" margin="4">
          padding=&quot;4&quot; margin=&quot;4&quot;
        </Box>
      </Box>
      <Box background="bg.subtle" borderRadius="md">
        <Box
          paddingX="6"
          paddingY="2"
          background="accent.soft"
          color="accent.solid"
          borderRadius="sm"
          marginY="3"
        >
          paddingX=&quot;6&quot; paddingY=&quot;2&quot;
        </Box>
      </Box>
      <Box background="bg.subtle" borderRadius="md" padding="2">
        <Box
          paddingTop="1"
          paddingRight="3"
          paddingBottom="5"
          paddingLeft="6"
          background="accent.soft"
          color="accent.solid"
          borderRadius="sm"
        >
          Individual sides: t=1 r=3 b=5 l=6
        </Box>
      </Box>
    </Stack>
  ),
};

// ── Colour & border tokens ─────────────────────────────────────────────

export const ColorTokens: Story = {
  render: () => (
    <Stack gap="3">
      <Inline gap="3">
        <Box padding="3" background="bg.canvas" color="fg.default" borderRadius="sm">
          bg.canvas
        </Box>
        <Box padding="3" background="bg.surface" color="fg.default" borderRadius="sm">
          bg.surface
        </Box>
        <Box padding="3" background="bg.subtle" color="fg.default" borderRadius="sm">
          bg.subtle
        </Box>
        <Box padding="3" background="bg.muted" color="fg.default" borderRadius="sm">
          bg.muted
        </Box>
      </Inline>
      <Inline gap="3">
        <Box padding="3" background="accent.soft" color="accent.solid" borderRadius="sm">
          accent.soft
        </Box>
        <Box padding="3" background="accent.solid" color="accent.onSolid" borderRadius="sm">
          accent.solid
        </Box>
        <Box
          padding="3"
          background="feedback.success.soft"
          color="feedback.success.foreground"
          borderRadius="sm"
        >
          success.soft
        </Box>
        <Box
          padding="3"
          background="feedback.danger.soft"
          color="feedback.danger.foreground"
          borderRadius="sm"
        >
          danger.soft
        </Box>
      </Inline>
    </Stack>
  ),
};

// ── Borders + radius + shadow ──────────────────────────────────────────

export const BordersAndShadows: Story = {
  render: () => (
    <Inline gap="4">
      <Box
        padding="4"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
        borderRadius="sm"
      >
        solid 1
      </Box>
      <Box
        padding="4"
        borderWidth="2"
        borderStyle="dashed"
        borderColor="accent.ring"
        borderRadius="md"
      >
        dashed 2
      </Box>
      <Box
        padding="4"
        borderWidth="4"
        borderStyle="dotted"
        borderColor="accent.solid"
        borderRadius="lg"
      >
        dotted 4
      </Box>
      <Box padding="4" background="bg.surface" borderRadius="md" boxShadow="sm">
        shadow sm
      </Box>
      <Box padding="4" background="bg.surface" borderRadius="md" boxShadow="lg">
        shadow lg
      </Box>
    </Inline>
  ),
};

// ── Responsive values ──────────────────────────────────────────────────

export const Responsive: Story = {
  render: () => (
    <Stack gap="3">
      <Text color="fg.muted">Resize the viewport to see values step through base → md → lg.</Text>
      <Box
        padding={{ base: '2', md: '6', lg: '10' }}
        background={{ base: 'accent.soft', md: 'bg.surface', lg: 'accent.solid' }}
        color={{ base: 'accent.solid', md: 'fg.default', lg: 'accent.onSolid' }}
        borderRadius={{ base: 'sm', md: 'md', lg: 'xl' }}
        width={{ base: 'full', md: '320px', lg: '480px' }}
        boxShadow={{ base: 'xs', md: 'md', lg: 'xl' }}
      >
        <Stack gap="1">
          <Text weight="semibold">Responsive Box</Text>
          <Text size="sm">padding · background · radius · width · shadow all step</Text>
        </Stack>
      </Box>
    </Stack>
  ),
};

// ── Sizing ─────────────────────────────────────────────────────────────

export const Sizing: Story = {
  render: () => (
    <Stack gap="3">
      <Box width="full" padding="2" background="accent.soft" borderRadius="sm">
        width=&quot;full&quot;
      </Box>
      <Box width="240px" padding="2" background="accent.soft" borderRadius="sm">
        width=&quot;240px&quot;
      </Box>
      <Box width="50%" padding="2" background="accent.soft" borderRadius="sm">
        width=&quot;50%&quot;
      </Box>
      <Box minHeight="80px" padding="2" background="bg.subtle" borderRadius="sm">
        minHeight=&quot;80px&quot;
      </Box>
      <Box maxWidth="prose" padding="3" background="bg.subtle" borderRadius="sm">
        <Text>
          maxWidth=&quot;prose&quot; (65ch). Good for long paragraphs to limit line length for
          readability.
        </Text>
      </Box>
    </Stack>
  ),
};

// ── Polymorphic `as` ───────────────────────────────────────────────────

export const PolymorphicAs: Story = {
  name: 'Polymorphic `as`',
  render: () => (
    <Stack gap="3">
      <Box
        as="a"
        href="#top"
        padding="3"
        background="bg.surface"
        borderRadius="sm"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
        color="fg.default"
        display="inline-block"
      >
        as=&quot;a&quot; — renders an &lt;a&gt;
      </Box>
      <Box
        as="section"
        padding="4"
        background="accent.soft"
        color="accent.solid"
        borderRadius="md"
        aria-label="Section"
      >
        as=&quot;section&quot; — semantic landmark
      </Box>
      <Box
        as="button"
        type="button"
        onClick={() => {
          // no-op
        }}
        padding="3"
        background="accent.solid"
        color="accent.onSolid"
        borderRadius="sm"
        style={{ border: 0, cursor: 'pointer' }}
      >
        as=&quot;button&quot; — clickable
      </Box>
    </Stack>
  ),
};

// ── asChild ────────────────────────────────────────────────────────────

export const AsChild: Story = {
  name: 'asChild — merge onto existing element',
  render: () => (
    <Stack gap="3">
      <Text>
        <code>asChild</code> merges Box&rsquo;s className + style onto the single child instead of
        wrapping it. Useful for composing with framework links / custom components.
      </Text>
      <Box asChild padding="3" background="accent.soft" color="accent.solid" borderRadius="md">
        <button type="button">asChild &lt;button&gt;</button>
      </Box>
      <Box
        asChild
        padding="3"
        background="bg.surface"
        borderRadius="sm"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
      >
        <a href="https://lumen.dev">asChild &lt;a&gt;</a>
      </Box>
    </Stack>
  ),
};

// ── Position ───────────────────────────────────────────────────────────

export const Position: Story = {
  render: () => (
    <Box position="relative" minHeight="160px" background="bg.subtle" borderRadius="md" padding="3">
      <Box
        position="absolute"
        top="3"
        right="3"
        padding="1"
        background="accent.solid"
        color="accent.onSolid"
        borderRadius="sm"
      >
        top-right
      </Box>
      <Box
        position="absolute"
        bottom="3"
        left="3"
        padding="1"
        background="accent.soft"
        color="accent.solid"
        borderRadius="sm"
      >
        bottom-left
      </Box>
      <Text color="fg.muted">position=&quot;relative&quot; parent with two absolute children.</Text>
    </Box>
  ),
};

// ── Article card (realistic) ───────────────────────────────────────────

export const ArticleCard: Story = {
  render: () => (
    <Box
      padding="5"
      background="bg.surface"
      borderRadius="lg"
      borderWidth="1"
      borderStyle="solid"
      borderColor="border.default"
      boxShadow="sm"
      maxWidth="420px"
    >
      <Stack gap="2">
        <Box
          display="inline-flex"
          paddingX="2"
          paddingY="0.5"
          background="accent.soft"
          color="accent.solid"
          borderRadius="sm"
          width="fit"
        >
          <Text size="xs" weight="semibold">
            PRODUCT
          </Text>
        </Box>
        <Heading level={3} size="lg">
          Introducing the new layout primitives
        </Heading>
        <Text color="fg.muted">
          A suite of zero-opinion building blocks. Tokens in, CSS variables out.
        </Text>
      </Stack>
    </Box>
  ),
};

// ── RTL behaviour ──────────────────────────────────────────────────────

export const Rtl: Story = {
  name: 'RTL — physical props',
  render: () => (
    <DirectionProvider dir="rtl">
      <Stack gap="3">
        <Text color="fg.muted">Physical props (paddingLeft) stay on the left even in RTL.</Text>
        <Box
          padding="3"
          paddingLeft="8"
          background="bg.surface"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          بكس ·{' '}
          <span style={{ textDecoration: 'underline' }}>
            extra paddingLeft is on the visual left (physical prop)
          </span>
        </Box>
      </Stack>
    </DirectionProvider>
  ),
};
