import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../../../typography/Heading/Heading.js';
import { Text } from '../../../typography/Text/Text.js';
import { Box } from '../Box/Box.js';
import { Container } from '../Container/Container.js';
import { Grid } from '../Grid/Grid.js';
import { Inline } from '../Inline/Inline.js';
import { Stack } from '../Stack/Stack.js';
import { Section } from './Section.js';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    space: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<typeof Section>;

export const Playground: Story = {
  args: { space: 'md', background: 'bg.surface' },
  render: (args) => (
    <Section {...args}>
      <Container paddingX={{ base: '4', md: '6' }}>
        <Stack gap="2">
          <Heading level={2}>Playground section</Heading>
          <Text>
            Tweak <code>space</code> in the controls to see padding change.
          </Text>
        </Stack>
      </Container>
    </Section>
  ),
};

// ── Space presets ─────────────────────────────────────────────────────

export const SpaceSizes: Story = {
  render: () => (
    <Box>
      {(['sm', 'md', 'lg', 'xl'] as const).map((space, i) => (
        <Section key={space} space={space} background={i % 2 === 0 ? 'bg.subtle' : 'bg.surface'}>
          <Container paddingX={{ base: '4', md: '6' }}>
            <Text variant="overline">space=&quot;{space}&quot;</Text>
          </Container>
        </Section>
      ))}
    </Box>
  ),
};

// ── Hero ──────────────────────────────────────────────────────────────

export const Hero: Story = {
  render: () => (
    <Section
      space="xl"
      background="accent.solid"
      color="accent.onSolid"
      paddingX={{ base: '4', md: '6' }}
    >
      <Container>
        <Stack gap="4" align="start" maxWidth="prose">
          <Text variant="overline">ANNOUNCEMENT</Text>
          <Heading level={1} size="5xl">
            Layout primitives you actually want to use
          </Heading>
          <Text size="lg">
            Zero-opinion building blocks — tokens in, CSS variables out. Compose the whole system
            without touching a stylesheet.
          </Text>
          <Inline gap="3">
            <Box
              padding="3"
              paddingX="4"
              background="bg.surface"
              color="fg.default"
              borderRadius="md"
            >
              <Text weight="semibold">Get started</Text>
            </Box>
            <Box padding="3" paddingX="4" borderRadius="md">
              <Text weight="semibold">Read the docs</Text>
            </Box>
          </Inline>
        </Stack>
      </Container>
    </Section>
  ),
};

// ── Alternating bands ─────────────────────────────────────────────────

export const AlternatingBands: Story = {
  render: () => (
    <Box>
      <Section space="lg" background="bg.canvas" paddingX={{ base: '4', md: '6' }}>
        <Container>
          <Stack gap="3">
            <Heading level={2}>Features</Heading>
            <Text color="fg.muted">Canvas background band.</Text>
            <Grid columns={{ base: 1, md: 3 }} gap="3">
              {['Tokens', 'Primitives', 'Themes'].map((label) => (
                <Box
                  key={label}
                  padding="4"
                  background="bg.surface"
                  borderRadius="md"
                  borderWidth="1"
                  borderStyle="solid"
                  borderColor="border.default"
                >
                  <Heading level={4}>{label}</Heading>
                </Box>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
      <Section space="lg" background="bg.subtle" paddingX={{ base: '4', md: '6' }}>
        <Container>
          <Stack gap="3">
            <Heading level={2}>Pricing</Heading>
            <Text color="fg.muted">Muted-subtle background band.</Text>
          </Stack>
        </Container>
      </Section>
      <Section
        space="lg"
        background="accent.solid"
        color="accent.onSolid"
        paddingX={{ base: '4', md: '6' }}
      >
        <Container>
          <Stack gap="3">
            <Heading level={2}>Call to action</Heading>
            <Text>Accent band for emphasis.</Text>
          </Stack>
        </Container>
      </Section>
    </Box>
  ),
};

// ── With responsive paddingX ──────────────────────────────────────────

export const ResponsiveGutter: Story = {
  render: () => (
    <Section
      space="lg"
      background="bg.surface"
      paddingX={{ base: '3', sm: '5', md: '8', lg: '12' }}
    >
      <Container>
        <Stack gap="2">
          <Heading level={3}>Responsive gutters</Heading>
          <Text color="fg.muted">paddingX steps 3 → 5 → 8 → 12 across breakpoints.</Text>
        </Stack>
      </Container>
    </Section>
  ),
};

// ── Semantic `as` variants ────────────────────────────────────────────

export const SemanticElements: Story = {
  name: 'as="main" / "article" / "aside"',
  render: () => (
    <Box>
      <Section as="main" space="md" background="bg.surface" paddingX="4">
        <Container>
          <Heading level={2}>as=&quot;main&quot;</Heading>
          <Text color="fg.muted">Primary landmark for the page.</Text>
        </Container>
      </Section>
      <Section as="article" space="md" background="bg.subtle" paddingX="4">
        <Container>
          <Heading level={2}>as=&quot;article&quot;</Heading>
          <Text color="fg.muted">Self-contained content block.</Text>
        </Container>
      </Section>
      <Section as="aside" space="md" background="accent.soft" paddingX="4">
        <Container>
          <Heading level={2}>as=&quot;aside&quot;</Heading>
          <Text>Complementary content.</Text>
        </Container>
      </Section>
    </Box>
  ),
};

// ── Footer ────────────────────────────────────────────────────────────

export const Footer: Story = {
  render: () => (
    <Section space="lg" background="bg.canvas" color="fg.default" paddingX={{ base: '4', md: '6' }}>
      <Container>
        <Grid columns={{ base: 2, md: 4 }} gap="6">
          {['Product', 'Company', 'Resources', 'Legal'].map((title) => (
            <Stack key={title} gap="2">
              <Text variant="overline">{title}</Text>
              <Text color="fg.muted">Features</Text>
              <Text color="fg.muted">Pricing</Text>
              <Text color="fg.muted">Docs</Text>
            </Stack>
          ))}
        </Grid>
        <Inline justify="between" align="center" paddingTop="8">
          <Text color="fg.subtle" size="sm">
            © 2026 Cynosure
          </Text>
          <Text color="fg.subtle" size="sm">
            Made with care
          </Text>
        </Inline>
      </Container>
    </Section>
  ),
};
