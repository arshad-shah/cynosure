import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Section } from '../Section/Section.js';
import { Stack } from '../Stack/Stack.js';
import { Container } from './Container.js';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'prose', 'full'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Container>;

const DemoSurface = ({ label }: { label: string }) => (
  <Box
    background="accent.soft"
    color="accent.solid"
    padding="5"
    borderRadius="md"
    borderWidth="1"
    borderStyle="solid"
    borderColor="accent.ring"
  >
    <Text weight="semibold">{label}</Text>
  </Box>
);

export const Playground: Story = {
  args: { size: 'lg', paddingX: '4' },
  render: (args) => (
    <Container {...args}>
      <DemoSurface label={`size="${args.size ?? 'lg'}"`} />
    </Container>
  ),
};

// ── All sizes ──────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Box padding="6" background="bg.canvas">
      <Stack gap="3">
        {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
          <Container key={size} size={size} paddingX={{ base: '4', md: '6' }}>
            <DemoSurface label={`size="${size}"`} />
          </Container>
        ))}
      </Stack>
    </Box>
  ),
};

// ── Full & prose ───────────────────────────────────────────────────────

export const FullAndProse: Story = {
  render: () => (
    <Box padding="6" background="bg.canvas">
      <Stack gap="3">
        <Container size="full">
          <DemoSurface label='size="full" — no max-width, spans the viewport' />
        </Container>
        <Container size="prose" paddingX={{ base: '4', md: '6' }}>
          <Box
            background="bg.surface"
            padding="5"
            borderRadius="md"
            borderWidth="1"
            borderStyle="solid"
            borderColor="border.default"
          >
            <Stack gap="2">
              <Heading level={3}>Optimised for reading</Heading>
              <Text>
                <code>size=&quot;prose&quot;</code> caps the container at ~65ch so long-form text
                keeps comfortable line-length. Use this for articles, documentation, and any
                body-heavy surface where readability trumps screen usage.
              </Text>
              <Text color="fg.muted">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip.
              </Text>
            </Stack>
          </Box>
        </Container>
      </Stack>
    </Box>
  ),
};

// ── Inside a Section ──────────────────────────────────────────────────

export const WithSection: Story = {
  name: 'Inside a Section (typical page pattern)',
  render: () => (
    <Box>
      <Section
        space="xl"
        background="accent.solid"
        color="accent.onSolid"
        paddingX={{ base: '4', md: '6' }}
      >
        <Container>
          <Stack gap="3">
            <Heading level={1} size="4xl">
              Container inside Section
            </Heading>
            <Text>
              A full-width Section band holds the canvas styling; a Container sits inside to limit
              width and centre horizontally.
            </Text>
          </Stack>
        </Container>
      </Section>
      <Section space="lg">
        <Container paddingX={{ base: '4', md: '6' }}>
          <Stack gap="3">
            <Heading level={2}>Body section</Heading>
            <Text color="fg.muted">
              Use this pattern on every marketing/documentation page: full-bleed bands, centred
              columns inside.
            </Text>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};

// ── Responsive ────────────────────────────────────────────────────────

export const ResponsivePadding: Story = {
  name: 'Responsive gutter padding',
  render: () => (
    <Box padding="6" background="bg.canvas">
      <Container size="lg" paddingX={{ base: '3', sm: '5', md: '8', lg: '12' }}>
        <DemoSurface label="paddingX scales 3 → 5 → 8 → 12" />
      </Container>
    </Box>
  ),
};

// ── Nested containers (edge case) ─────────────────────────────────────

export const Nested: Story = {
  name: 'Nested (prose inside lg)',
  render: () => (
    <Box padding="6" background="bg.canvas">
      <Container size="lg" paddingX={{ base: '4', md: '6' }}>
        <Box
          padding="5"
          background="bg.surface"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Container size="prose">
            <Stack gap="2">
              <Heading level={3}>Article</Heading>
              <Text>
                The outer container bounds the page; the inner prose container bounds paragraph
                width. A classic blog article pattern.
              </Text>
            </Stack>
          </Container>
        </Box>
      </Container>
    </Box>
  ),
};

// ── As `main` landmark ────────────────────────────────────────────────

export const AsMainLandmark: Story = {
  render: () => (
    <Container as="main" size="lg" paddingX="4" paddingY="6">
      <Stack gap="2">
        <Heading level={1}>Main landmark</Heading>
        <Text>
          Pass <code>as=&quot;main&quot;</code> to render a semantic landmark. Pair with a
          corresponding skip link for accessibility.
        </Text>
      </Stack>
    </Container>
  ),
};
